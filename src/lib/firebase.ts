// Firebase Configuration
// Replace these placeholder values with your actual Firebase project config
// Get them from: Firebase Console > Project Settings > Your apps > Web app

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCG_zzPqHhVEyi7-Z-tmXXT0Qx03yZCG-g",
  authDomain: "voxel-dbe93.firebaseapp.com",
  projectId: "voxel-dbe93",
  storageBucket: "voxel-dbe93.firebasestorage.app",
  messagingSenderId: "704974895646",
  appId: "1:704974895646:web:be6bfa8073e7f6acd80c0f",
  measurementId: "G-J7X7BY19DZ",
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;

try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
  }
} catch {
  console.warn("Firebase not configured yet. Using localStorage fallback.");
}

/** Ensure we have an anonymous auth session for Storage uploads. */
let authReady: Promise<void> | null = null;
export async function ensureAuth(): Promise<void> {
  if (!auth) return;
  if (!authReady) {
    authReady = signInAnonymously(auth).then(() => {}).catch((err) => {
      console.warn("Anonymous auth failed:", err);
      authReady = null; // allow retry
    });
  }
  return authReady;
}

export { app, db, storage, auth };
export const isFirebaseConfigured = () => firebaseConfig.apiKey !== "YOUR_API_KEY";
