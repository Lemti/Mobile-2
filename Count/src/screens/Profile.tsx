import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Profile() {
  const navigation = useNavigation<any>();
  const user = auth.currentUser;
  const insets = useSafeAreaInsets();

  const onLogout = async () => {
    await signOut(auth);
    Alert.alert('Déconnexion', 'À bientôt 👋');
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex:1, backgroundColor:'#0b0b0f' }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingTop: insets.top + 8,      // ✅ sous l’encoche
          paddingBottom: insets.bottom + 12, // ✅ au-dessus du home indicator
        }}
      >
        <Text style={{ color:'#fff', fontSize:22, fontWeight:'800', marginBottom:16 }}>
          Profil
        </Text>

        <View style={{ backgroundColor:'#111318', padding:16, borderRadius:14, marginBottom:16 }}>
          <Text style={{ color:'#9aa0a6' }}>Connecté·e en tant que</Text>
          <Text style={{ color:'#fff', fontWeight:'800', marginTop:6 }}>
            {user?.email ?? 'Anonyme'}
          </Text>
        </View>

        <Pressable
          onPress={onLogout}
          style={{ backgroundColor:'#ef4444', padding:16, borderRadius:14, alignItems:'center' }}
        >
          <Text style={{ color:'#fff', fontWeight:'800' }}>Déconnexion</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
