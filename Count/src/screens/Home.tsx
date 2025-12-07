import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  Pressable,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebase';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { searchMovies, TMDB_IMG_W92 } from '../services/tmdb';
import DismissKeyboardView from '../components/DismissKeyboardView';

type Movie = { id: number; title: string; poster_path?: string };
type Screening = {
  id: string;
  movieTitle: string;
  posterPath?: string;
  cinemaName?: string;
  createdAt?: any;
};

export default function Home() {
  const nav = useNavigation<any>();

  // form
  const [movieQuery, setMovieQuery] = useState('');
  const [movieResults, setMovieResults] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [cinema, setCinema] = useState('');

  // list
  const [screenings, setScreenings] = useState<Screening[]>([]);

  // TMDB live search
  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (movieQuery.trim().length < 2) {
        setMovieResults([]);
        return;
      }
      try {
        const movies = await searchMovies(movieQuery.trim());
        if (!alive) return;
        setMovieResults(movies);
      } catch {
        if (alive) setMovieResults([]);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [movieQuery]);

  // Firestore live list
  useEffect(() => {
    const q = query(collection(db, 'screenings'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setScreenings(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Screening[]
      );
    });
  }, []);

  const canAdd = useMemo(
    () => !!selectedMovie && cinema.trim().length >= 2,
    [selectedMovie, cinema]
  );

  const add = async () => {
    if (!canAdd || !selectedMovie) return;
    Keyboard.dismiss();

    await addDoc(collection(db, 'screenings'), {
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      posterPath: selectedMovie.poster_path ?? null,
      cinemaName: cinema.trim(),
      createdAt: serverTimestamp(),
    });
    setSelectedMovie(null);
    setMovieQuery('');
    setMovieResults([]);
    setCinema('');
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#0b0b0f' }}
      edges={['bottom']}
    >
      <DismissKeyboardView style={{ flex: 1 }} keyboardOffset={90}>
        <View style={[s.container, { paddingTop: 0 }]}>
          {/* Formulaire */}
          <View style={[s.card, { marginTop: 12 }]}>
            <Text style={s.sectionTitle}>Créer une séance</Text>

            {/* Movie input */}
            <View style={{ position: 'relative' }}>
              <TextInput
                value={selectedMovie ? selectedMovie.title : movieQuery}
                onChangeText={(t) => {
                  setSelectedMovie(null);
                  setMovieQuery(t);
                }}
                placeholder="Film (recherche TMDB)"
                placeholderTextColor="#6b7280"
                style={s.input}
                returnKeyType="next"
              />

              {/* dropdown */}
              {movieResults.length > 0 && !selectedMovie && (
                <View style={s.dropdown}>
                  <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={movieResults}
                    keyExtractor={(m) => String(m.id)}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => {
                          setSelectedMovie(item);
                          setMovieResults([]);
                          Keyboard.dismiss();
                        }}
                        style={s.option}
                      >
                          {item.poster_path ? (
                            <Image
                              source={{
                                uri: `${TMDB_IMG_W92}${item.poster_path}`,
                              }}
                              style={s.poster}
                            />
                          ) : (
                            <View
                              style={[s.poster, { backgroundColor: '#222' }]}
                            />
                          )}
                          <Text style={s.optionTxt}>{item.title}</Text>
                        </Pressable>
                      )}
                  />
                </View>
              )}
            </View>

            {/* Cinema */}
            <TextInput
              value={cinema}
              onChangeText={setCinema}
              placeholder="Cinéma / salle"
              placeholderTextColor="#6b7280"
              style={s.input}
              returnKeyType="done"
              onSubmitEditing={add}
            />

            <Pressable
              onPress={add}
              disabled={!canAdd}
              style={[s.primaryBtn, { opacity: canAdd ? 1 : 0.5 }]}
            >
              <Text style={s.primaryTxt}>Ajouter</Text>
            </Pressable>
          </View>

          {/* Liste des séances */}
          <FlatList
            data={screenings}
            keyExtractor={(it) => it.id}
            ListHeaderComponent={() => (
              <Text style={[s.listTitle, { marginTop: 8 }]}>Séances</Text>
            )}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 12,
            }}
            renderItem={({ item }) => {
              const poster = item.posterPath
                ? `${TMDB_IMG_W92}${item.posterPath}`
                : undefined;
              return (
                <Pressable
                  onPress={() => nav.navigate('SessionDetail', { id: item.id })}
                  style={s.row}
                >
                  {poster ? (
                    <Image source={{ uri: poster }} style={s.rowPoster} />
                  ) : (
                    <View style={[s.rowPoster, { backgroundColor: '#222' }]} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowTitle}>{item.movieTitle}</Text>
                    {!!item.cinemaName && (
                      <Text style={s.rowSub}>{item.cinemaName}</Text>
                    )}
                  </View>
                </Pressable>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </DismissKeyboardView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0f' },
  card: {
    backgroundColor: '#111318',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    marginHorizontal: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#0f1115',
    borderWidth: 1,
    borderColor: '#1f2937',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    maxHeight: 260,
    backgroundColor: '#0f1115',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    zIndex: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  optionTxt: { color: '#fff', flexShrink: 1 },
  poster: { width: 32, height: 48, borderRadius: 6 },
  primaryBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 2,
  },
  primaryTxt: { color: '#fff', fontWeight: '700' },
  listTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 22,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#111318',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  rowPoster: { width: 46, height: 69, borderRadius: 8 },
  rowTitle: { color: '#fff', fontWeight: '700', marginBottom: 2, flexShrink: 1 },
  rowSub: { color: '#9aa0a6', fontSize: 12 },
});
