import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDS5ZUWogRUYBQgMkRsKwDPvuVMTvKex8o",
    authDomain: "fir-chat-app-397da.firebaseapp.com",
    databaseURL: "https://fir-chat-app-397da-default-rtdb.firebaseio.com",
    projectId: "fir-chat-app-397da",
    storageBucket: "fir-chat-app-397da.firebasestorage.app",
    messagingSenderId: "479325246054",
    appId: "1:479325246054:web:c69cc883acfb5a5bd813a7",
    measurementId: "G-28WQKCJTG1"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app; 