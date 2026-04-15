// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // <-- Added this

const firebaseConfig = {
  apiKey: "AIzaSyBPv_6kSLgs5b3rH3kcBduPrjlusyB6e-U",
  authDomain: "sleep-sentinel-9798.firebaseapp.com",
  projectId: "sleep-sentinel-9798",
  storageBucket: "sleep-sentinel-9798.firebasestorage.app",
  messagingSenderId: "71284859522",
  appId: "1:71284859522:web:7f74257d655cb0b6674a9b",
  measurementId: "G-DJ3DY5GFHR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize and EXPORT the database so App.jsx can use it
export const db = getFirestore(app);