import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4ErxjDsJOPDz9txoNoJm3e9B7nK17xLk",
  authDomain: "mybooktracker-c0f43.firebaseapp.com",
  projectId: "mybooktracker-c0f43",
  storageBucket: "mybooktracker-c0f43.firebasestorage.app",
  messagingSenderId: "218489295166",
  appId: "1:218489295166:web:f02e7709ec935f855fa06f",
  measurementId: "G-26GDYP91B6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);