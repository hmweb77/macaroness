// src/lib/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized yet
let app;
let db;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firestore with better settings for Next.js
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Important for Next.js
    useFetchStreams: false
  });
  
  // Enable offline persistence (only in browser)
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support offline persistence');
      }
    });
  }
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

export { db, app };