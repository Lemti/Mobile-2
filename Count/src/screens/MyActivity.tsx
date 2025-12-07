import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, where, query, getDoc, doc } from 'firebase/firestore';

const TMDB_W92 = 'https://image.tmdb.org/t/p/w92';

export default function MyActivity({ navigation }: any) {
  const [uid, setUid] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => onAuthStateChanged(auth, u => setUid(u?.uid || '')), []);

  useEffect(() => {
    if (!uid) { setItems([]); return; }

    // Pas d'orderBy -> pas d'index composite requis
    const q = query(collection(db, 'counts'), where('userId', '==', uid));

    return onSnapshot(q, async snap => {
      const rows: any[] = [];
      for (const d of snap.docs) {
        const c = { id: d.id, ...(d.data() as any) };
        const sdoc = await getDoc(doc(db, 'screenings', c.screeningId));
        if (sdoc.exists()) rows.push({ ...c, screening: { id: sdoc.id, ...(sdoc.data() as any) } });
      }

      // tri côté client (desc)
      rows.sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return tb - ta;
      });

      setItems(rows);
    });
  }, [uid]);

  const renderItem = ({ item }: { item: any }) => {
    const s = item.screening;
    const poster = s?.posterPath ? `${TMDB_W92}${s.posterPath}` : undefined;
    return (
      <Pressable
        onPress={() => navigation.navigate('SessionDetail', { id: s.id })}
        style={{
          flexDirection: 'row',
          gap: 10,
          paddingVertical: 10,
          borderBottomWidth: 0.5,
          borderBottomColor: '#23252d',
        }}
      >
        {poster
          ? <Image source={{ uri: poster }} style={{ width: 46, height: 69, borderRadius: 8 }} />
          : <View style={{ width: 46, height: 69, borderRadius: 8, backgroundColor: '#222' }} />}
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }} numberOfLines={2}>
            {s?.movieTitle ?? 'Séance'}
          </Text>
          {!!s?.cinemaName && <Text style={{ color: '#9aa0a6' }}>{s.cinemaName}</Text>}
          <Text style={{ color: '#22c55e', marginTop: 4 }}>Mon comptage : {item.value}</Text>
        </View>
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <Text style={{ color: '#94a3b8', paddingHorizontal: 16 }}>
      Aucune participation pour l’instant.
    </Text>
  );

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#0b0b0f' }}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        // ✅ évite le chevauchement en haut (encoche) et en bas (home indicator / tab bar)
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 12,
          paddingHorizontal: 16,
        }}
        ListHeaderComponent={() => (
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 10 }}>
            Mon activité
          </Text>
        )}
      />
    </SafeAreaView>
  );
}
