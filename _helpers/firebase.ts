import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAirSTyEyT-L-sUgyzLhAxDnarXyn_M4wg',
  authDomain: 'equipobasketuoc.firebaseapp.com',
  projectId: 'equipobasketuoc',
  storageBucket: 'equipobasketuoc.firebasestorage.app',
  messagingSenderId: '104990418626',
  appId: '1:104990418626:web:8fcc96952ac603f1637d5b',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
