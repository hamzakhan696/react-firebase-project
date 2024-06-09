import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getFirestore, getDocs } from "firebase/firestore";

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
const db = getFirestore(app)
const auth = getAuth(app)

const colRef = collection(db, 'Products')

getDocs(colRef)
.then((snapshot) => {
// console.log(snapshot.docs)
let Products = []
snapshot.docs.forEach((doc) =>{
  Products.push({...doc.data(), id: doc.id})
})
console.log(Products)
})
.catch(err =>{
  console.log(err.message)
  throw err;
})

export { app, auth, db };
