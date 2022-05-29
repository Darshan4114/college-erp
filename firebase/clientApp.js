// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // YOUR_FIREBASE_CONFIG
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export default app;
