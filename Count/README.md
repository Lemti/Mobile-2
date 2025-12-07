
# Count — Expo SDK 54 + Firebase (Skeleton)

MVP pour compter les spectateurs d'une séance et comparer les comptages via un graphique.

## Installation
```bash
npm i
# Aligne automatiquement les versions sur SDK 54
npx expo install --fix
npx expo doctor --fix-dependencies
```

## Variables d'environnement
Copie `.env.example` → `.env` et remplis avec la config **Web** Firebase.
Expo lit les variables `EXPO_PUBLIC_*` côté client.

## Démarrage
```bash
npx expo start -c
```

## Firestore
- Crée les collections `screenings`, `counts`.
- Applique les **Rules** depuis `firebase.rules`.

## Notes
- Pas d'`expo-router` (entrée classique via `App.tsx`).
- Auth anonyme automatique.
- Un seul comptage par utilisateur/séance (ID = `${screeningId}_${uid}` + rules).
