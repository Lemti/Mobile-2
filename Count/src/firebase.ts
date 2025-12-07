import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  type Auth,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// App singleton
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth + persistance
let auth: Auth;

try {
  // Sur natif (Expo Go / iOS / Android)
  // getReactNativePersistence est exposé via le sous-module react-native
  const { getReactNativePersistence } = require('firebase/auth/react-native');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Fallback (ex. web ou si déjà initialisé)
  auth = getAuth(app);
  if (Platform.OS === 'web') {
    // Sur web, on force la persistance locale du navigateur
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  }
}

export { auth };
export const db = getFirestore(app);

// --- Auth anonyme utilitaire (si tu en as besoin) ---
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
export const ensureAnonymousAuth = () =>
  new Promise<string>((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) { unsub(); return resolve(user.uid); }
      try {
        const res = await signInAnonymously(auth);
        unsub(); resolve(res.user.uid);
      } catch (e) { reject(e); }
    });
  });

  