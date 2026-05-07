import React, { useState } from 'react';
import { auth } from '../firebase';

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail 
} from "firebase/auth";

const AuthView = () => {
  // --- STATE MANAGEMENT ---
  // isLogin: Switches the screen between "Login" mode and "Sign Up" mode
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only used during Sign Up

  // --- LOGIC: LOGIN & SIGNUP ---
  const handleAuth = async () => {
    try {
      if (isLogin) {
        // Log in an existing user
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Create a brand new user account
        const res = await createUserWithEmailAndPassword(auth, email, password);
        // This part saves their "Full Name" to their profile so we can display it later
        await updateProfile(res.user, { displayName: name });
        alert("Account created! Please log in.");
        setIsLogin(true); // Switch back to login view after signing up
      }
    } catch (err) {
      // If password is too short or email is taken, Firebase sends an error message here
      alert(err.message);
    }
  };

  // --- LOGIC: FORGOT PASSWORD ---
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) return alert("Enter email first!");
    // Sends a real reset email from Google to the user's inbox
    await sendPasswordResetEmail(auth, email);
    alert("Reset link sent!");
  };

  return (
    <div className="auth-container-wrapper">
      <div className="glass-card auth-container">
        {/* Dynamic Heading: Changes based on isLogin state */}
        <h3>{isLogin ? "Login" : "Create Account"}</h3>
        
        {/* Only shows the Name input if the user is on the "Create Account" screen */}
        {!isLogin && (
          <input 
            type="text" 
            placeholder="Full Name" 
            onChange={(e) => setName(e.target.value)} 
          />
        )}
        
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
        />

        {/* Dynamic Button text: Sign In vs Sign Up */}
        <button id="login-btn" onClick={handleAuth}>
          {isLogin ? "Sign In" : "Sign Up"}
        </button>

        {/* Toggle between Login and Signup modes */}
        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
            {isLogin ? "Create one" : "Back to Login"}
          </a>
        </p>
        
        {/* Forgot Password link: Only shows on the Login screen */}
        {isLogin && (
          <a href="#" onClick={handleForgot} style={{fontSize: '0.8rem'}}>
            Forgot Password?
          </a>
        )}
      </div> 
    </div> 
  );
};

export default AuthView;