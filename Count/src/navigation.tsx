import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Welcome from './screens/Welcome'
import SignIn from './screens/SignIn'
import SignUp from './screens/SignUp'
import Home from './screens/Home'
import SessionDetail from 'src/screens/SessionDetail'

const Stack = createNativeStackNavigator()

export default function AppNav() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown:false }} />
        <Stack.Screen name="SignIn" component={SignIn} options={{ title:'Connexion' }} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ title:'Inscription' }} />
        <Stack.Screen name="Home" component={Home} options={{ title:'Séances' }} />
        <Stack.Screen name="SessionDetail" component={SessionDetail} options={{ title:'Détail' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
