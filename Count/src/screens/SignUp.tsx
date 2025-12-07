import React, { useRef, useState } from 'react';
import { View, Text, Alert, TextInput, StatusBar, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

import DismissKeyboardView from '../components/DismissKeyboardView';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';

export default function SignUp({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [loading, setLoading] = useState(false);

  const pwdRef = useRef<TextInput>(null);
  const pwd2Ref = useRef<TextInput>(null);

  const submit = async () => {
    Keyboard.dismiss();

    if (!email || !pwd || !pwd2) {
      return Alert.alert('Inscription', 'Tous les champs sont requis.');
    }
    if (pwd !== pwd2) {
      return Alert.alert('Inscription', 'Les mots de passe ne correspondent pas.');
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email.trim(), pwd);

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (e: any) {
      const msg =
        e?.code === 'auth/email-already-in-use'
          ? 'Email déjà utilisé.'
          : e?.code === 'auth/weak-password'
          ? 'Mot de passe trop faible.'
          : 'Inscription impossible.';

      Alert.alert('Inscription', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DismissKeyboardView
      style={{ flex: 1, backgroundColor: '#0b0b0f' }}
      keyboardOffset={90}
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
            Créer un compte
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
            returnKeyType="next"
            onSubmitEditing={() => pwd2Ref.current?.focus()}
            // @ts-ignore si TextField n'est pas typé avec ref
            ref={pwdRef}
          />

          {/* Confirmation */}
          <TextField
            label="Confirmer le mot de passe"
            value={pwd2}
            onChangeText={setPwd2}
            placeholder="Confirmer le mot de passe"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={submit}
            // @ts-ignore
            ref={pwd2Ref}
          />

          <PrimaryButton
            title="Créer un compte"
            onPress={submit}
            loading={loading}
            style={{ marginTop: 20 }}
          />

          <Text
            onPress={() => navigation.replace('SignIn')}
            style={{
              color: '#22c55e',
              marginTop: 18,
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            J’ai déjà un compte
          </Text>
        </View>
      </SafeAreaView>
    </DismissKeyboardView>
  );
}
