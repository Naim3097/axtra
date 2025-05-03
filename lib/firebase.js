import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBHh8hIB2QJP8PsRMBDhBGSugqFT0vnxsY",
  authDomain: "nexova-firebase.firebaseapp.com",
  projectId: "nexova-firebase",
  storageBucket: "nexova-firebase.firebasestorage.app", // ✅ FIXED
  messagingSenderId: "424597625227",
  appId: "1:424597625227:web:3793ac20853bed0500378e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
