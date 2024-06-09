import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { doSignInWithEmailAndPassword } from '../../../firebase/auth';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from '../../../firebase/firebase';
import toastr from "toastr";
import "toastr/build/toastr.min.css";

const Login = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
      } catch (error) {
        handleFetchError(error);
      }
    }
    fetchData();
  }, []);

  const handleFetchError = (error) => {
    console.error("Error fetching users:", error);
    toastr.error("Error fetching users");
    throw error;
  };

  const fetchUsers = async () => {
    const colRef = collection(db, 'users');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      role: doc.data().role
    }));
  };

  const signIn = async (email, password) => {
    try {
      const userCredential = await doSignInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (!user) {
        throw new Error("User credential is null");
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      let role = null;
      if (userDoc.exists()) {
        const userData = userDoc.data();
        role = userData.role;
      } else {
        console.error("No such user document!");
      }

      return { email: user.email, role };
    } catch (error) {
      handleSignInError(error);
    }
  };

  const handleSignInError = (error) => {
    console.error("Error signing in:", error);
    toastr.error("Error signing in");
    throw error;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);

      try {
        const { email: userEmail, role } = await signIn(email, password);
        const currentUser = users.find(user => user.email === userEmail);

        // check if logged in user is admin else user
        if (currentUser && currentUser.role === "admin") {
          navigate('/product');
          toastr.success('You have successfully logged in.', 'Login Successful');
        } else {
          navigate('/home');
          toastr.success('You have successfully logged in.', 'Login Successful');
        }
      } catch (error) {
        setErrorMessage("Error signing in: " + error.message);
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  return (
    <div>
<main className="w-full h-screen flex flex-col justify-center items-center relative">
  <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl relative z-20">

    <div className="text-center mb-6 relative z-30">
      <div className="mt-2">
        <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Sign In to Your Account</h3>
      </div>
    </div>
    <form onSubmit={onSubmit} className="space-y-4 relative z-30">
      <div>
        <label className="text-sm text-gray-600 font-bold">Email</label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value) }}
          className="bg-white-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600 font-bold">Password</label>
        <input
          disabled={isSigningIn}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => { setPassword(e.target.value) }}
          className="bg-white-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
        />
      </div>

      {errorMessage && (
        <span className="text-red-600 font-bold">{errorMessage}</span>
      )}

      <button
        type="submit"
        disabled={isSigningIn}
        className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isSigningIn ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
      >
        {isSigningIn ? 'Signing In...' : 'Sign In'}
      </button>
      <div className="text-sm text-center">
        Don't have an account?{' '}
        <Link to="/register" className="text-center text-sm hover:underline font-bold">Register</Link>
      </div>
    </form>
  </div>
</main>




    </div>
  );
};

export default Login;
