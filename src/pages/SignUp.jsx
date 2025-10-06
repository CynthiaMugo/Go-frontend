import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../index.css";

const API_URL = "http://localhost:5000";

function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = () => {
    // Reset messages
    setErrorMessage("");
    setSuccessMessage("");

    // Basic frontend validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    axios
      .post(`${API_URL}/user/signup`, { name, email, password })
      .then((res) => {
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("playerName", res.data.user.name);
        setSuccessMessage(res.data.message); 
        setName("");
        setEmail("");
        setPassword("");

        
        setTimeout(() => navigate("/mainmenu"), 1000); 
      })
      .catch((err) => {
        setErrorMessage(
          err?.response?.data?.error || "Error creating user, try again."
        );
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="centered">
      <h1 style={{ color: "#fff" }}>Enter the World of Go</h1>

      <input
        type="text"
        placeholder="Enter your name"
        className="input-field"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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

      <button onClick={handleSignup} disabled={isLoading}>
        {isLoading ? "Signing up..." : "Sign Up"}
      </button>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <button
          style={{ marginTop: "0.5rem", background: "#444", color: "#fff", padding: "0.5rem 1rem", cursor: "pointer" }}
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </button>


    </div>
  );
}

export default SignUp;
