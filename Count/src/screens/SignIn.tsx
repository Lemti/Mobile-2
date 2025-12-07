import React, { useState, useRef } from 'react';
import { View, Text, Alert, TextInput, StatusBar, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

import DismissKeyboardView from '../components/DismissKeyboardView';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';

export default function SignIn({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const pwdRef = useRef<TextInput>(null);

  const submit = async () => {
    Keyboard.dismiss();

    if (!email || !pwd) {
      Alert.alert('Connexion', 'Email et mot de passe requis.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), pwd);

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (e: any) {
      const msg =
        e?.code === 'auth/invalid-credential'
          ? 'Identifiants invalides.'
          : e?.code === 'auth/too-many-requests'
          ? 'Trop de tentatives. Réessaie plus tard.'
          : 'Impossible de te connecter.';

      Alert.alert('Connexion', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DismissKeyboardView
      style={{ flex: 1, backgroundColor: '#0b0b0f' }}
      keyboardOffset={80}
    >
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />

        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <Text
            style={{
              color: '#fff',
              fontSize: 34,
              fontWeight: '900',
              marginTop: 6,
              marginBottom: 22,
            }}
          >
            Connexion
          </Text>

          {/* Email */}
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            returnKeyType="next"
            onSubmitEditing={() => pwdRef.current?.focus()}
          />

          {/* Mot de passe */}
          <TextField
            label="Mot de passe"
            value={pwd}
            onChangeText={setPwd}
            placeholder="Mot de passe"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={submit}
            // @ts-ignore
            ref={pwdRef}
          />

          <PrimaryButton
            title="Se connecter"
            onPress={submit}
            loading={loading}
            style={{ marginTop: 20 }}
          />

          <Text
            onPress={() => navigation.replace('SignUp')}
            style={{
              color: '#22c55e',
              marginTop: 18,
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Créer un compte
          </Text>
        </View>
      </SafeAreaView>
    </DismissKeyboardView>
  );
}
