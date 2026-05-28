import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDq5g9maNY8zjJDzhF351TTT0l9GQCC2PU",
  authDomain: "resume-54303.firebaseapp.com",
  projectId: "resume-54303",
  storageBucket: "resume-54303.firebasestorage.app",
  messagingSenderId: "1001646383698",
  appId: "1:1001646383698:web:a239e8a35443820238b58b",
  measurementId: "G-S0SSNRFE4M"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };