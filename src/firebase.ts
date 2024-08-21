// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPoOvmufuaS3bMXcoLPZxVDO34G5Q07HE",
  authDomain: "ces-insights-dashboard-47f6f.firebaseapp.com",
  projectId: "ces-insights-dashboard-47f6f",
  storageBucket: "ces-insights-dashboard-47f6f.appspot.com",
  messagingSenderId: "272437874625",
  appId: "1:272437874625:web:a1c29e29c570a618f7e940",
  measurementId: "G-BWPTEQG6RG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export default app;