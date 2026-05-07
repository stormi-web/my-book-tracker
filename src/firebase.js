// Import the necessary functions from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // For login/signup features
import { getFirestore } from "firebase/firestore"; // For your database

// This object holds your "Secret Keys." 
// Instead of typing the keys here, we use 'import.meta.env'.
// This is a security best practice so your keys stay private on Vercel.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase: This actually starts the connection using the config above
const app = initializeApp(firebaseConfig);

// Export 'auth' so we can use it in App.jsx to log users in/out
export const auth = getAuth(app);

// Export 'db' so we can use it to save, delete, or edit books in the database
export const db = getFirestore(app);