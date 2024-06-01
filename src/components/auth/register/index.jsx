import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { doCreateUserWithEmailAndPassword } from '../../../firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { db } from '../../../firebase/firebase';
import toastr from "toastr";
import "toastr/build/toastr.min.css"; // Import toastr CSS

const Register = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (!isRegistering) {
      setIsRegistering(true);
      try {
        const userCredential = await doCreateUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: 'user' // Default role can be 'user'. Adjust as needed
        });

        navigate('/home');
        toastr.success('You have successfully logged in.', 'Login Successful');
      } catch (error) {
        setErrorMessage("Error creating account: " + error.message);
        setIsRegistering(false);
      }
    }
  };

  return (
    <>
      {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

      <main className="w-full h-screen flex flex-col justify-center items-center space-y-8">
     
        <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl relative">
        <div className="login-image absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none z-0">
      <img src="/logo.jpg" alt="logo" className="img-fluid h-full w-full object-cover" />
    </div>
          <div className="text-center mb-6">
            <div className="mt-2">
              <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Create a New Account</h3>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">Email</label>
              <input
                type="email"
                autoComplete='email'
                required
                value={email} onChange={(e) => { setEmail(e.target.value) }}
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">Password</label>
              <input
                type="password"
                autoComplete='new-password'
                required
                value={password} onChange={(e) => { setPassword(e.target.value) }}
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">Confirm Password</label>
              <input
                type="password"
                autoComplete='off'
                required
                value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value) }}
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
              />
            </div>
            {errorMessage && (
              <span className='text-red-600 font-bold'>{errorMessage}</span>
            )}
            <button
              type="submit"
              disabled={isRegistering}
              className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isRegistering ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
            >
              {isRegistering ? 'Signing Up...' : 'Sign Up'}
            </button>
            <div className="text-sm text-center">
              Already have an account? {' '}
              <Link to={'/login'} className="text-center text-sm hover:underline font-bold">Continue</Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default Register;
