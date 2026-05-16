import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCntDdH0W7J67ZVlQsNOgGCKoWXDSg3vD4",
  authDomain: "splitez-446e4.firebaseapp.com",
  projectId: "splitez-446e4",
  storageBucket: "splitez-446e4.firebasestorage.app",
  messagingSenderId: "551260515187",
  appId: "1:551260515187:web:ac874d13dfed2d469d3306",
  measurementId: "G-16GB1FWFJS"
};

const app = initializeApp(firebaseConfig);

// Khởi tạo Auth với Persistence (lưu trạng thái đăng nhập)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
