import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, Image, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { db, auth } from '../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const TMDB_W92 = 'https://image.tmdb.org/t/p/w92';

type Item = {
  id: string;
  movieTitle?: string;
  cinemaName?: string;
  posterPath?: string | null;
  createdAt?: any;
};

export default function PublicSessions({ navigation }: any) {
  const [uid, setUid] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const insets = useSafeAreaInsets();

  useEffect(() => onAuthStateChanged(auth, u => setUid(u?.uid || '')), []);

  useEffect(() => {
    const q = query(collection(db, 'screenings'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Item[];
      setItems(list);
    });
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 450);
  }, []);

  const renderEmpty = () => (
    <View style={{ alignItems:'center', marginTop:48, paddingHorizontal:24 }}>
      <Text style={{ color:'#94a3b8', fontSize:16, textAlign:'center' }}>
        Aucune séance disponible pour le moment 🍿
      </Text>
      {uid ? (
        <Pressable
          onPress={() => navigation.navigate('Home')}
          style={{ marginTop:16, backgroundColor:'#22c55e', paddingVertical:12, paddingHorizontal:18, borderRadius:12 }}
        >
          <Text style={{ color:'#0b0b0f', fontWeight:'800' }}>Créer une séance</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0b0f' }} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 12,
          paddingHorizontal: 16,
        }}
        renderItem={({ item }) => {
          const poster = item.posterPath ? `${TMDB_W92}${item.posterPath}` : undefined;
          return (
            <Pressable
              onPress={() => navigation.navigate('SessionDetail', { id: item.id })}
              style={{
                flexDirection: 'row',
                gap: 12,
                backgroundColor: '#111318',
                padding: 12,
                borderRadius: 16,
                marginBottom: 12,
              }}
            >
              {poster ? (
                <Image source={{ uri: poster }} style={{ width: 56, height: 84, borderRadius: 10, backgroundColor: '#1f2937' }} />
              ) : (
                <View style={{ width: 56, height: 84, borderRadius: 10, backgroundColor: '#1f2937' }} />
              )}
              <View style={{ flex: 1 }}>
                <Text numberOfLines={2} style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
                  {item.movieTitle ?? 'Séance'}
                </Text>
                {!!item.cinemaName && (
                  <Text style={{ color: '#9aa0a6', marginTop: 4 }}>{item.cinemaName}</Text>
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
