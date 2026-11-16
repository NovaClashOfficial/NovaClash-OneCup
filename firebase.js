
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyArv489bM5eZaoUjNNFnob8d39p0efU7Yc",
  authDomain: "novaclashoc-c5def.firebaseapp.com",
  projectId: "novaclashoc-c5def",
  storageBucket: "novaclashoc-c5def.firebasestorage.app",
  messagingSenderId: "710651760350",
  appId: "1:710651760350:web:4b3e8ee64bc73286cd7c4f",
  measurementId: "G-GMRJQ95N2E"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
