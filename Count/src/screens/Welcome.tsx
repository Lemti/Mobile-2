import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import DismissKeyboardView from '../components/DismissKeyboardView';
import PrimaryButton from '../components/PrimaryButton';

export default function Welcome({ navigation }: any) {
  return (
    <DismissKeyboardView style={{ backgroundColor:'#0b0b0f' }}>
      <View style={{ flex:1, padding:20, justifyContent:'center' }}>
        <Image
          source={require('../../assets/logo-popcorn.png')}
          style={{ width:160, height:160, alignSelf:'center', marginBottom:24 }}
          contentFit="cover"
          transition={300}
        />
        <Text style={{ color:'#fff', fontSize:42, fontWeight:'900', textAlign:'center' }}>Count</Text>
        <Text style={{ color:'#9aa0a6', textAlign:'center', marginTop:10 }}>
          Note tes séances, compte les spectateurs, compare en direct.
        </Text>

        <View style={{ height:28 }} />

        <PrimaryButton title="Voir les séances" onPress={() => navigation.navigate('PublicSessions')} />

        <Text style={{ color:'#64748b', textAlign:'center', marginVertical:14 }}>ou</Text>

        <PrimaryButton
          title="Se connecter"
          variant="secondary"
          onPress={() => navigation.navigate('SignIn')}
          style={{ marginBottom:12 }}
        />
        <PrimaryButton
          title="Créer un compte"
          variant="secondary"
          onPress={() => navigation.navigate('SignUp')}
        />
      </View>

      <Text style={{ color:'#475569', textAlign:'center', marginBottom:18 }}>— Expo + Firebase —</Text>
    </DismissKeyboardView>
  );
}
