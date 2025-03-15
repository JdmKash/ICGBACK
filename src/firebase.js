import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByAGelFM2mgijdeFBh3U2OYuEfa_S174o",
  authDomain: "immigrantcoin-5b00f.firebaseapp.com",
  projectId: "immigrantcoin-5b00f",
  storageBucket: "immigrantcoin-5b00f.firebasestorage.app",
  messagingSenderId: "777456556889",
  appId: "1:777456556889:web:270609423a94d2318dca48",
  measurementId: "G-7B90GS45YF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };