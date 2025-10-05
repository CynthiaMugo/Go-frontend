import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

function GameMenu() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  const startGame = async () => {
    setFeedback(null);
    setError(null);
    setIsStarting(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("You must be logged in to start a game.");
        navigate("/login");
        return;
      }

      const res = await axios.post(
        `${API_URL}/game/new`,
        {
          board_size: 9,
          board: {},
          turn: "black",
          scores: { black: 0, white: 0 },
          captured_white: 0,
          captured_black: 0,
          player_color: "black", 
          computer_color: "white",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFeedback(res.data.message);
      navigate("/board", { state: { game: res.data } });
    } catch (err) {
      setError(err.response?.data?.error || "Error starting a new game.");
    } finally {
      setIsStarting(false);
    }
  };

  const resumeGame = async () => {
    setFeedback(null);
    setError(null);
    setIsResuming(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("You must be logged in to resume a game.");
        navigate("/login");
        return;
      }

      const res = await axios.get(`${API_URL}/game/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFeedback("Resuming your saved game...");
      navigate("/board", { state: { game: res.data } });
    } catch (err) {
      setError(err.response?.data?.message || "No active game found.");
    } finally {
      setIsResuming(false);
    }
  };

   const logout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="centered menu-bg">
      <h1>Game Menu</h1>

      <div className="flex flex-col md:flex-row gap-6 mt-8">
        <button onClick={startGame} disabled={isStarting}>
          {isStarting ? "Starting..." : "Start Game"}
        </button>
        <button onClick={resumeGame} disabled={isResuming}>
          {isResuming ? "Resuming..." : "Resume Game"}
        </button>
      </div>

      {feedback && <p style={{ color: "green", marginTop: "1rem" }}>{feedback}</p>}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      <div style={{ marginTop: "1rem" }}>
      <button 
        onClick={logout} 
        style={{ backgroundColor: "#F59E0B", color: "white", padding: "0.6rem 1.2rem", border: "none", borderRadius: "6px", cursor: "pointer",fontWeight: "bold"
        }}>
        Logout
      </button>
    </div>

    </div>
  );
}

export default GameMenu;
