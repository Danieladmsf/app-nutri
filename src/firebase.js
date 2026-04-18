import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// NUTRIAPP - Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC2hJ6OlGNxYy2BfZX_yYWJmqnTq-x6SMM",
  authDomain: "nutriapp-81e52.firebaseapp.com",
  projectId: "nutriapp-81e52",
  storageBucket: "nutriapp-81e52.firebasestorage.app",
  messagingSenderId: "235813328039",
  appId: "1:235813328039:web:78a92f364c0867dc41b782",
  measurementId: "G-ZJ2TQYCR59"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
