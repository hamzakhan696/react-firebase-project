import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB8K0879FLT2e5zzp7cqoQdmKeZEHiDVhE",
  authDomain: "myfirebase-react-project-19a55.firebaseapp.com",
  projectId: "myfirebase-react-project-19a55",
  storageBucket: "myfirebase-react-project-19a55.appspot.com",
  messagingSenderId: "394750304393",
  appId: "1:394750304393:web:62b5d926c0032e67caa658",
  measurementId: "G-SYDWWX6JMJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)



export { app, auth };
