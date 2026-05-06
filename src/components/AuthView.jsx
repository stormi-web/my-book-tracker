import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail 
} from "firebase/auth";

const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        alert("Account created! Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) return alert("Enter email first!");
    await sendPasswordResetEmail(auth, email);
    alert("Reset link sent!");
  };

  return (
    <div className="auth-container-wrapper">
      <div className="glass-card auth-container">
        <h3>{isLogin ? "Login" : "Create Account"}</h3>
        
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

        <button id="login-btn" onClick={handleAuth}>
          {isLogin ? "Sign In" : "Sign Up"}
        </button>

        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
            {isLogin ? "Create one" : "Back to Login"}
          </a>
        </p>
        
        {isLogin && (
          <a href="#" onClick={handleForgot} style={{fontSize: '0.8rem'}}>
            Forgot Password?
          </a>
        )}
      </div> 
    </div> /* Added this closing div git config --global "sandra" git config --global "quimboale@gmail.com"  */
  );
};

export default AuthView;
