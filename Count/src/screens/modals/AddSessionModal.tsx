import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '../../firebase';
import { searchMovies, type TMDBMovie } from '../../services/tmdb';
import DismissKeyboardView from '../../components/DismissKeyboardView';

const TMDB_W185 = 'https://image.tmdb.org/t/p/w185';
const PLACEHOLDER = 'https://via.placeholder.com/100x150?text=No+Image';

export default function AddSessionModal({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [cinema, setCinema] = useState('');

  const [q, setQ] = useState('');
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [selected, setSelected] = useState<TMDBMovie | null>(null);

  const canSearch = useMemo(() => q.trim().length >= 2, [q]);

  useEffect(() => {
    let t: any;
    const run = async () => {
      if (!canSearch) {
        setResults([]);
        return;
      }
      try {
        const r = await searchMovies(q);
        setResults(r);
      } catch {
        // silencieux, c'est juste une aide
      }
    };
    t = setTimeout(run, 300);
    return () => clearTimeout(t);
  }, [q, canSearch]);

  const create = async () => {
    Keyboard.dismiss();

    if (!title.trim() || !cinema.trim()) return;

    const ref = await addDoc(collection(db, 'screenings'), {
      movieTitle: title.trim(),
      cinemaName: cinema.trim(),
      startsAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
      tmdbId: selected?.id ?? null,
      posterPath: selected?.poster_path ?? null,
    });

    navigation.replace('SessionDetail', { id: ref.id });
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      style={{ flex: 1, backgroundColor: '#0b0b0f' }}
    >
      <DismissKeyboardView style={{ padding: 16 }}>
        <View style={{ flex: 1, gap: 12 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
            Nouvelle séance
          </Text>

          {/* Label + champ de recherche TMDB */}
          <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>
            Film (recherche TMDB)
          </Text>
          <TextInput
            style={{
              backgroundColor: '#1c1c1e',
              color: '#fff',
              borderRadius: 8,
              padding: 10,
              marginTop: 4,
            }}
            placeholder="Rechercher un film"
            placeholderTextColor="#888"
            value={q}
            returnKeyType="search"
            onChangeText={(t) => {
              setQ(t);
              setSelected(null);
              if (!t) setTitle('');
            }}
            onSubmitEditing={Keyboard.dismiss}
          />

          {results.length > 0 && (
            <FlatList
              data={results}
              keyExtractor={(m) => String(m.id)}
              keyboardShouldPersistTaps="handled"
              style={{
                maxHeight: 280,
                borderWidth: 1,
                borderColor: '#222',
                borderRadius: 10,
              }}
              renderItem={({ item: m }) => (
                <Pressable
                  onPress={() => {
                    setSelected(m);
                    setTitle(m.title);
                    setQ(m.title);
                    setResults([]);
                    Keyboard.dismiss();
                  }}
                  style={{
                    padding: 10,
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'center',
                    backgroundColor: '#0f1115',
                  }}
                >
                  <Image
                    source={{
                      uri: m.poster_path
                        ? `${TMDB_W185}${m.poster_path}`
                        : PLACEHOLDER,
                    }}
                    style={{ width: 40, height: 60, borderRadius: 6 }}
                  />
                  <Text style={{ color: '#fff', flex: 1 }} numberOfLines={1}>
                    {m.title}
                  </Text>
                </Pressable>
              )}
            />
          )}

          {/* Label + titre manuel */}
          <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 8 }}>
            Titre (si pas trouvé)
          </Text>
          <TextInput
            style={{
              backgroundColor: '#1c1c1e',
              color: '#fff',
              borderRadius: 8,
              padding: 10,
              marginTop: 4,
            }}
            placeholder="Titre du film"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
          />

          {/* Label + cinéma */}
          <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 8 }}>
            Cinéma / salle
          </Text>
          <TextInput
            style={{
              backgroundColor: '#1c1c1e',
              color: '#fff',
              borderRadius: 8,
              padding: 10,
              marginTop: 4,
            }}
            placeholder="Nom du cinéma ou de la salle"
            placeholderTextColor="#888"
            value={cinema}
            onChangeText={setCinema}
            returnKeyType="done"
            onSubmitEditing={create}
          />

          <Pressable
            onPress={create}
            style={{
              backgroundColor: '#22c55e',
              padding: 14,
              borderRadius: 12,
              alignItems: 'center',
              marginTop: 12,
            }}
          >
            <Text style={{ color: '#0b0b0f', fontWeight: '800' }}>Créer</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            style={{ alignItems: 'center', marginTop: 10 }}
          >
            <Text style={{ color: '#3b82f6' }}>Annuler</Text>
          </Pressable>
        </View>
      </DismissKeyboardView>
    </SafeAreaView>
  );
}
