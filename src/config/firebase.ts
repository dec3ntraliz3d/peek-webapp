import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCPvCdtq8mXSvCxVDSdu8Br8DYAUTN0iE8",
  authDomain: "peek-5e8ee.firebaseapp.com",
  projectId: "peek-5e8ee",
  storageBucket: "peek-5e8ee.firebasestorage.app",
  messagingSenderId: "353597577018",
  appId: "1:353597577018:web:f3658ee26742f7c972e203"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
