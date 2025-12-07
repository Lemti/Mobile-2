import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  Keyboard,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  setDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth, db } from "../firebase";
import { THEME } from "../theme";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import { useToast } from "../components/useToast";
import { getMovieDetails, TMDB_IMG_W500 } from "../services/tmdb";
import CountsChart from "../components/CountsChart";
import DismissKeyboardView from "../components/DismissKeyboardView";

type R = {
  id: string;
  screeningId: string;
  userId: string;
  stars: number;
  comment?: string;
  createdAt?: any;
};

type C = {
  id: string;
  screeningId: string;
  userId: string;
  value: number;
  createdAt?: any;
};

type ScreeningDoc = {
  movieId?: number;
  movieTitle?: string;
  posterPath?: string | null;
  cinemaName?: string;
  createdAt?: any;
};

export default function SessionDetail() {
  const { params } = useRoute<any>();
  const navigation = useNavigation<any>();
  const { show } = useToast();

  const screeningId: string = params?.id;
  const [uid, setUid] = useState<string>("");

  // ---- Données séance
  const [movieId, setMovieId] = useState<number | undefined>();
  const [movieTitle, setMovieTitle] = useState("Séance");
  const [posterPath, setPosterPath] = useState<string | null | undefined>(null);
  const [cinemaName, setCinemaName] = useState<string | undefined>(undefined);

  // ---- Synopsis TMDB
  const [overview, setOverview] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  // ---- Saisie comptage
  const [countInput, setCountInput] = useState<string>("");

  // ---- Reviews (notes + commentaires)
  const [myStars, setMyStars] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const [counts, setCounts] = useState<C[]>([]);
  const [reviews, setReviews] = useState<R[]>([]);

  // --------- Auth
  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid || "")), []);

  // --------- Charger la séance + synopsis
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const sdoc = await getDoc(doc(db, "screenings", screeningId));
        if (!sdoc.exists()) throw new Error("not-found");
        const data = sdoc.data() as ScreeningDoc;

        if (!alive) return;
        setMovieTitle(data?.movieTitle || "Séance");
        setPosterPath(data?.posterPath ?? null);
        setCinemaName(data?.cinemaName);
        setMovieId(data?.movieId);

        // synopsis TMDB
        if (data?.movieId) {
          try {
            const d = await getMovieDetails(data.movieId);
            if (!alive) return;
            setOverview(d?.overview || undefined);
          } catch {
            // synopsis non bloquant
          }
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [screeningId]);

  // --------- Flux comptages (tri client)
  useEffect(() => {
    const qCounts = query(
      collection(db, "counts"),
      where("screeningId", "==", screeningId)
    );
    return onSnapshot(qCounts, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as C[];
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setCounts(list);
    });
  }, [screeningId]);

  // --------- Flux reviews (tri client)
  useEffect(() => {
    const qReviews = query(
      collection(db, "reviews"),
      where("screeningId", "==", screeningId)
    );
    return onSnapshot(qReviews, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as R[];
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setReviews(list);
    });
  }, [screeningId]);

  // --------- Agrégats comptages
  const averageCount = useMemo(() => {
    if (counts.length === 0) return 0;
    const values = counts.map((c) => c.value || 0);
    const sum = values.reduce((s, v) => s + v, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }, [counts]);

  const medianCount = useMemo(() => {
    if (counts.length === 0) return 0;
    const values = counts
      .map((c) => c.value || 0)
      .sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    if (values.length % 2 === 1) return values[mid];
    return (values[mid - 1] + values[mid]) / 2;
  }, [counts]);

  // --------- Agrégats notes
  const averageStars = useMemo(() => {
    if (reviews.length === 0) return 0;
    const values = reviews.map((r) => r.stars || 0);
    const sum = values.reduce((s, v) => s + v, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }, [reviews]);

  const posterUri = useMemo(() => {
    return posterPath ? `${TMDB_IMG_W500}${posterPath}` : undefined;
  }, [posterPath]);

  // --------- Actions
  const saveCount = async () => {
    if (!uid) {
      show({ type: "info", message: "Connecte-toi pour enregistrer." });
      return;
    }

    const n = Number(countInput);
    if (Number.isNaN(n) || n < 0) {
      show({ type: "error", message: "Saisis un nombre valide." });
      return;
    }

    const id = `${screeningId}_${uid}`;
    const countRef = doc(db, "counts", id);

    // vérifier si l'utilisateur a déjà un comptage pour cette séance
    const existing = await getDoc(countRef);
    if (existing.exists()) {
      show({
        type: "info",
        message: "Tu as déjà enregistré un comptage pour cette séance.",
      });
      return;
    }

    await setDoc(countRef, {
      id,
      screeningId,
      userId: uid,
      value: n,
      createdAt: serverTimestamp(),
    });

    show({ type: "success", message: "Comptage enregistré ✅" });
  };

  const publishReview = async () => {
    if (!uid) {
      show({ type: "info", message: "Connecte-toi pour publier." });
      return;
    }
    if (myStars < 1) {
      show({ type: "error", message: "Choisis une note." });
      return;
    }
    await addDoc(collection(db, "reviews"), {
      screeningId,
      userId: uid,
      stars: myStars,
      comment: comment?.trim() || "",
      createdAt: serverTimestamp(),
    });
    setComment("");
    setMyStars(0);
    show({ type: "success", message: "Avis publié ✨" });
  };

  // --------- UI loading
  if (loading) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{
          flex: 1,
          backgroundColor: THEME.colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#22c55e" />
      </SafeAreaView>
    );
  }

  // --------- UI main
  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: THEME.colors.bg }}
    >
      <DismissKeyboardView style={{ flex: 1 }} keyboardOffset={90}>
        <ScrollView
          contentContainerStyle={{
            padding: THEME.spacing(2),
            paddingBottom: THEME.spacing(4),
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* -------- Header fiche film -------- */}
          <View style={{ marginBottom: THEME.spacing(2) }}>
            <View
              style={{
                flexDirection: "row",
                gap: 14,
                alignItems: "flex-start",
                marginTop: 6,
              }}
            >
              {posterUri ? (
                <Image
                  source={{ uri: posterUri }}
                  style={{
                    width: 110,
                    height: 165,
                    borderRadius: 12,
                    backgroundColor: "#111318",
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 110,
                    height: 165,
                    borderRadius: 12,
                    backgroundColor: "#111318",
                  }}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text numberOfLines={2} style={styles.title}>
                  {movieTitle}
                </Text>
                {!!cinemaName && (
                  <Text
                    numberOfLines={1}
                    style={{ color: THEME.colors.textMuted, marginTop: 4 }}
                  >
                    {cinemaName}
                  </Text>
                )}
                {!!overview && (
                  <Text style={{ color: "#cbd5e1", marginTop: 10 }}>
                    {overview}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* -------- Carte : Saisie comptage -------- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Votre comptage</Text>
            <Text style={styles.label}>Nombre de spectateurs présents</Text>

            <View style={styles.row}>
              <TextInput
                placeholder="0"
                placeholderTextColor={THEME.colors.textMuted}
                value={countInput}
                onChangeText={(t) => {
                  const only = t.replace(/[^\d]/g, "");
                  setCountInput(only);
                }}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={styles.inputBig}
              />
              <SecondaryButton
                title="− 1"
                fullWidth={false}
                style={styles.stepBtn}
                onPress={() =>
                  setCountInput(
                    String(
                      Math.max(
                        0,
                        (parseInt(countInput || "0", 10) || 0) - 1
                      )
                    )
                  )
                }
              />
              <SecondaryButton
                title="+ 1"
                fullWidth={false}
                style={styles.stepBtn}
                onPress={() =>
                  setCountInput(
                    String((parseInt(countInput || "0", 10) || 0) + 1)
                  )
                }
              />
            </View>

            <PrimaryButton
              title="Enregistrer"
              onPress={saveCount}
              style={{ marginTop: THEME.spacing(1) }}
            />
          </View>

          {/* -------- Carte : Moyenne des comptages -------- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Moyenne des comptages</Text>
            <Text style={styles.kpi}>{averageCount}</Text>
            <Text style={styles.muted}>
              Basée sur {counts.length} comptage(s) enregistré(s).
            </Text>
          </View>

          {/* -------- Carte : Graphique de comparaison -------- */}
          {counts.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Comparaison des comptages</Text>
              <Text style={styles.muted}>
                Chaque barre correspond au comptage d’un utilisateur.
              </Text>

              <View style={{ marginTop: THEME.spacing(2) }}>
                <CountsChart
                  data={counts.map((c) => ({
                    userId: c.userId,
                    value: c.value,
                  }))}
                  mean={averageCount}
                  median={medianCount}
                />
              </View>
            </View>
          )}

          {/* -------- Carte : Note moyenne + ajout d'avis -------- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Note moyenne</Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Text style={styles.kpi}>{averageStars}</Text>
              <Text style={[styles.muted, { marginLeft: 8 }]}>/ 5</Text>
            </View>
            <Text style={styles.muted}>Basée sur {reviews.length} avis.</Text>

            <Text
              style={[styles.sectionTitle, { marginTop: THEME.spacing(2) }]}
            >
              Votre avis
            </Text>
            <Text style={styles.label}>Commentaire</Text>
            <TextInput
              placeholder="Ambiance, confort, son..."
              placeholderTextColor={THEME.colors.textMuted}
              value={comment}
              onChangeText={setComment}
              style={styles.input}
              multiline
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            <Text style={[styles.label, { marginTop: THEME.spacing(1) }]}>
              Votre note
            </Text>
            <StarPicker value={myStars} onChange={setMyStars} />

            <PrimaryButton
              title="Publier"
              onPress={publishReview}
              style={{ marginTop: THEME.spacing(1) }}
            />
          </View>

          {/* -------- Liste des commentaires -------- */}
          <View style={[styles.card, { paddingBottom: 8 }]}>
            <Text style={styles.sectionTitle}>Commentaires</Text>
            {reviews.length === 0 ? (
              <Text style={styles.muted}>
                Aucun commentaire pour l’instant.
              </Text>
            ) : (
              <FlatList
                data={reviews}
                keyExtractor={(it) => it.id}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => (
                  <View style={styles.reviewItem}>
                    <StarRow value={item.stars} />
                    {!!item.comment && (
                      <Text
                        style={{
                          color: THEME.colors.text,
                          marginTop: 6,
                        }}
                      >
                        {item.comment}
                      </Text>
                    )}
                  </View>
                )}
                scrollEnabled={false} // on est déjà dans une ScrollView
              />
            )}
          </View>
        </ScrollView>
      </DismissKeyboardView>
    </SafeAreaView>
  );
}

/* ---------------------- Stars --------------------- */

function Star({ filled, size = 22 }: { filled: boolean; size?: number }) {
  return (
    <Text
      style={{
        fontSize: size,
        marginRight: 6,
        color: filled ? "#fbbf24" : "#4b5563", // or jaune vs gris
      }}
    >
      ★
    </Text>
  );
}

function StarRow({ value }: { value: number }) {
  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} filled={i <= value} size={18} />
      ))}
    </View>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={{ flexDirection: "row", marginTop: THEME.spacing(0.5) }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable
          key={i}
          onPress={() => {
            Keyboard.dismiss();   // 👈 ferme le clavier dès qu'on touche les étoiles
            onChange(i);
          }}
          style={{ paddingVertical: 6, paddingRight: 6 }}
        >
          <Star filled={i <= value} />
        </Pressable>
      ))}
    </View>
  );
}

/* ---------------------- Styles --------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    padding: THEME.spacing(2),
  },
  header: { marginBottom: THEME.spacing(1) },
  back: { color: THEME.colors.textMuted, marginBottom: 4 },
  title: { ...THEME.font.h1, color: THEME.colors.text },
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radii.xl,
    padding: THEME.spacing(2),
    marginTop: THEME.spacing(2),
  },
  sectionTitle: { ...THEME.font.h2, color: THEME.colors.text },
  label: {
    ...THEME.font.small,
    color: THEME.colors.textMuted,
    marginTop: THEME.spacing(1),
  },
  muted: { ...THEME.font.small },
  kpi: {
    color: THEME.colors.text,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: THEME.spacing(1),
  },
  inputBig: {
    flex: 1,
    backgroundColor: THEME.colors.input,
    borderRadius: THEME.radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    color: THEME.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  stepBtn: {
    paddingHorizontal: 16,
    minWidth: 70,
    justifyContent: "center",
  },
  input: {
    backgroundColor: THEME.colors.input,
    borderRadius: THEME.radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: THEME.colors.text,
    marginTop: THEME.spacing(1),
    minHeight: 44,
  },
  reviewItem: {
    backgroundColor: "#0f1116",
    borderRadius: THEME.radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
});
