
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWzFS0rGv4eVq_PZPtaBpyBE0mBEJTgnI",
  authDomain: "bonchie-agro.firebaseapp.com",
  projectId: "bonchie-agro",
  storageBucket: "bonchie-agro.firebasestorage.app",
  messagingSenderId: "1085845592420",
  appId: "1:1085845592420:web:649287d6d76fa7c14a8271"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
