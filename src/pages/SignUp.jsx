import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const handleSignup = () => {
    if (name.trim()) {
      // Navigate to main menu and pass name
      navigate("/mainmenu", { state: { name } });
    } else {
      alert("Please enter your name to continue.");
    }
  };

  const handleLogin = () => {
    navigate("/mainmenu", { state: { name: "Returning Player" } });
  };

  return (
    <div className="centered">
      <h1>Enter the World of Go</h1>
      <input
        type="text"
        placeholder="Enter your name"
        className="input-field"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={handleSignup}>Sign Up</button>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Signup;
