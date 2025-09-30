"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false); // toggle mode
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Save multiple users
  const handleSignup = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    let users = JSON.parse(localStorage.getItem("goUsers")) || [];

    // check if email already exists
    if (users.some((user) => user.email === email)) {
      alert("An account with this email already exists. Please log in.");
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem("goUsers", JSON.stringify(users));

    navigate("/mainmenu", { state: { name, email } });
  };

  // Login checks multiple users
  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }
    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("goUsers")) || [];
    const foundUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!foundUser) {
      alert("Invalid email or password.");
      return;
    }

    setName(foundUser.name); // update state
    navigate("/mainmenu", { state: { name: foundUser.name, email } });
  };

  return (
    <div className="centered">
      <h1 style={{ color: "#fff" }}>
        {isLogin ? "Login to Continue" : "Enter the World of Go"}
      </h1>

      {!isLogin && (
        <input
          type="text"
          placeholder="Enter your name"
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}

      <input
        type="email"
        placeholder="Enter your email"
        className="input-field"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter your password"
        className="input-field"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {isLogin ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <button onClick={handleSignup}>Sign Up</button>
      )}

      <button
        style={{ marginTop: "0.5rem", background: "#444" }}
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
      </button>
    </div>
  );
}

export default AuthPage;
