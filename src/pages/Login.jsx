import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../index.css";

const API_URL = "http://localhost:5000";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter your email and password.");
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/user/login`, { login: email, password });
      setSuccessMessage(res.data.message || "Logged in successfully!");

    //  store JWT token for authenticated requests
      localStorage.setItem("access_token", res.data.access_token);

      setTimeout(() => navigate("/mainmenu"), 600);
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.error || "Error logging in, try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="centered">
      <h1 style={{ color: "#fff" }}>Login to Continue</h1>

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

      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <button
        style={{ marginTop: "0.5rem", background: "#444", color: "#fff", padding: "0.5rem 1rem", cursor: "pointer" }}
        onClick={() => navigate("/signup")}
      >
        Need an account? Sign Up
      </button>
    </div>
  );
}

export default Login;
