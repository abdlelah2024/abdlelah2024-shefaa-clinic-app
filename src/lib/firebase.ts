
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth as getFirebaseAuth, Auth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8y8zNqyOPrdj_t1Cm0Da4b02E-1Lmj6g",
  authDomain: "ahmed-qaid-salem.firebaseapp.com",
  databaseURL: "https://ahmed-qaid-salem-default-rtdb.firebaseio.com",
  projectId: "ahmed-qaid-salem",
  storageBucket: "ahmed-qaid-salem.appspot.com",
  messagingSenderId: "867106202505",
  appId: "1:867106202505:web:a924f6d095758d5918f758",
  measurementId: "G-KWC3W85DPR"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

let authInstance: Auth | null = null;

const getAuth = () => {
    if (!authInstance) {
        authInstance = getFirebaseAuth(app);
    }
    return authInstance;
};


export { app, db, getAuth };
