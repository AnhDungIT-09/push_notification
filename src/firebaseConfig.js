// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const VITE_FIREBASE_API_KEY = "AIzaSyDOM_ylN-lZVMjbMtbTzw4TX_MR9QUuQvM";
const VITE_FIREBASE_AUTH_DOMAIN = "nha-khoa-4272c.firebaseapp.com";
const VITE_FIREBASE_PROJECT_ID = "nha-khoa-4272c";
const VITE_FIREBASE_STORAGE_BUCKET = "nha-khoa-4272c.firebasestorage.app";
const VITE_FIREBASE_MESSAGING_SENDER_ID = "997027631544";
const VITE_FIREBASE_APP_ID = "1:997027631544:web:e04c4aeb51c0f692f8ff4d";
const VITE_FIREBASE_MEASUREMENT_ID = "G-24NXV9659H";

const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID,
  measurementId: VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
