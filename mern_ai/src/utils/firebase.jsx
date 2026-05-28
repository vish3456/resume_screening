
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDq5g9maNY8zjJDzhF351TTT0l9GQCC2PU",
  authDomain: "resume-54303.firebaseapp.com",
  projectId: "resume-54303",
  storageBucket: "resume-54303.firebasestorage.app",
  messagingSenderId: "1001646383698",
  appId: "1:1001646383698:web:a239e8a35443820238b58b",
  measurementId: "G-S0SSNRFE4M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { auth, provider };