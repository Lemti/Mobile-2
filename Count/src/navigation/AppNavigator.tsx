import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

// Écrans
import Welcome from '../screens/Welcome';
import PublicSessions from '../screens/PublicSessions';
import Home from '../screens/Home';
import Profile from '../screens/Profile';
import MyActivity from '../screens/MyActivity';
import SessionDetail from '../screens/SessionDetail';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SignUp';

// Types des routes
export type RootStackParamList = {
  Welcome: undefined;
  PublicSessions: undefined;
  SignIn: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  SessionDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// --- Tabs (après connexion) ---
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0b0b0f' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontSize: 16, fontWeight: '600' },
        tabBarStyle: { backgroundColor: '#0b0b0f', borderTopColor: '#111318' },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={Home}
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Séances"
        component={PublicSessions}
        options={{
          title: 'Séances',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Activité"
        component={MyActivity}
        options={{
          title: 'Mon activité',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={Profile}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// --- App Navigator ---
export default function AppNavigator() {
  const theme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: '#0b0b0f' },
  };

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: { backgroundColor: '#0b0b0f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontSize: 16, fontWeight: '600' },
          headerBackTitle: 'Retour', // évite "Welcome" à côté de la flèche
        }}
      >

        {/* Public / Auth */}
        <Stack.Screen
          name="Welcome"
          component={Welcome}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="PublicSessions"
          component={PublicSessions}
          options={{ title: 'Séances publiques' }}
        />

        <Stack.Screen
          name="SignIn"
          component={SignIn}
          options={{ title: 'Connexion' }}
        />

        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{ title: 'Créer un compte' }}
        />

        {/* Espace connecté (tabs) */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        {/* Détail accessible depuis partout */}
        <Stack.Screen
          name="SessionDetail"
          component={SessionDetail}
          options={{
            title: 'Séance',
            // headerBackTitle vient déjà de screenOptions: "Retour"
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
