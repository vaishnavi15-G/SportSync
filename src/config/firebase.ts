import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC0O6Rjq_7iN4S0luyZc9Rztns8_Louyd0",
    authDomain: "sportsync-4b468.firebaseapp.com",
    projectId: "sportsync-4b468",
    storageBucket: "sportsync-4b468.firebasestorage.app",
    messagingSenderId: "815825350590",
    appId: "1:815825350590:web:f66f4eadfb8dfe8f4793ef",
    measurementId: "G-XKHQT98MSS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
