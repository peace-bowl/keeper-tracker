/**
 * firebase.js — Firebase app initialization for Keeper Tracker
 *
 * HOW TO SET UP YOUR FIREBASE PROJECT:
 * ─────────────────────────────────────────────────────────────
 * 1. Go to https://console.firebase.google.com
 * 2. Click "Add project" → name it (e.g. "keeper-tracker") → Create project
 * 3. In the left nav, click "Build" → "Firestore Database" → "Create database"
 *    → Choose "Native mode" → Pick any region → Enable
 * 4. Go to "Project settings" (⚙️ top-left) → "Your apps" section
 *    → Click the </> (Web) button → Register app → copy the firebaseConfig object
 * 5. Paste the values from your config into the VITE_ env vars below.
 *
 * Create a `.env.local` file in the repo root (it is git-ignored) with:
 *
 *   VITE_FIREBASE_API_KEY=AIza...
 *   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 *   VITE_FIREBASE_PROJECT_ID=your-project-id
 *   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
 *   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
 *   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
 *
 * FIRESTORE SECURITY RULES (paste in Firebase Console → Firestore → Rules):
 * ─────────────────────────────────────────────────────────────────────────
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{database}/documents {
 *       match /campaigns/{roomCode} {
 *         allow read, write: if true;
 *         match /investigators/{invId} {
 *           allow read, write: if true;
 *         }
 *       }
 *     }
 *   }
 * ─────────────────────────────────────────────────────────────────────────
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase has been configured — all required keys must be present
export const FIREBASE_CONFIGURED = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId &&
  firebaseConfig.apiKey !== 'undefined'
);

let app = null;
let db = null;

if (FIREBASE_CONFIGURED) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (err) {
    console.error('[Keeper Tracker] Firebase init failed:', err);
  }
}

export { db };
export default app;
