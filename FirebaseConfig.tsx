// FirebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuiD_B2CyFFG5UHjV_mzTtghywkFSCk20",
  authDomain: "finalyearproject-5df3b.firebaseapp.com",
  projectId: "finalyearproject-5df3b",
  storageBucket: "finalyearproject-5df3b.appspot.com",
  messagingSenderId: "1097078625910",
  appId: "1:1097078625910:web:0f2e7c450cbf2bf0747157"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Firebase Auth with AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firebase Storage
const storage = getStorage(app);

export { auth, db, storage, firebaseConfig };
