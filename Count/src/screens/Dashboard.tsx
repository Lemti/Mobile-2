import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, where, query } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Dashboard() {
  const [uid, setUid] = useState('');
  const [total, setTotal] = useState(0);
  const [month, setMonth] = useState(0);
  const [recent, setRecent] = useState<any[]>([]);
  const nav = useNavigation<any>();

  useEffect(() => onAuthStateChanged(auth, u => setUid(u?.uid || '')), []);
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'counts'), where('userId', '==', uid));
    return onSnapshot(q, snap => {
      const data = snap.docs.map(d => d.data());
      setTotal(data.length);
      const now = new Date();
      const thisMonth = data.filter((d: any) => {
        if (!d.createdAt?.toDate) return false;
        const dt = d.createdAt.toDate();
        return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
      });
      setMonth(thisMonth.length);
      setRecent(data.slice(0, 3));
    });
  }, [uid]);

  return (
    <View style={s.container}>
      <Text style={s.title}>Salut 👋</Text>
      <Text style={s.subtitle}>Prêt·e à compter des spectateurs ?</Text>

      <View style={s.actions}>
        <Pressable style={[s.actionBtn, { backgroundColor: '#22c55e' }]} onPress={() => nav.navigate('Sessions')}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={s.actionTxt}>Créer une séance</Text>
        </Pressable>
        <Pressable style={[s.actionBtn, { backgroundColor: '#1e293b' }]} onPress={() => nav.navigate('PublicSessions')}>
          <Ionicons name="film" size={18} color="#fff" />
          <Text style={s.actionTxt}>Voir les séances</Text>
        </Pressable>
      </View>

      <View style={s.stats}>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Mes participations</Text>
          <Text style={s.statValue}>{total}</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Ce mois-ci</Text>
          <Text style={s.statValue}>{month}</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Activité récente</Text>
      {recent.length === 0 ? (
        <Text style={{ color: '#94a3b8' }}>Aucune contribution récente.</Text>
      ) : (
        recent.map((r, i) => (
          <Text key={i} style={{ color: '#fff', marginBottom: 4 }}>
            • Comptage enregistré ({r.value})
          </Text>
        ))
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0f', padding: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#94a3b8', marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionTxt: { color: '#fff', fontWeight: '600' },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#111318', padding: 16, borderRadius: 14, marginHorizontal: 4 },
  statLabel: { color: '#9aa0a6', fontSize: 13 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 4 },
  sectionTitle: { color: '#fff', fontWeight: '700', marginBottom: 8 },
});
