import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function GameMenu() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const API_URL = "http://localhost:5000/game";
  const token = localStorage.getItem("access_token");

  const handleNewGame = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/new`,
        { board: {}, turn: "black", scores: {} },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(" Game created:", res.data);

      if (!res.data || !res.data.game_id) {
        alert("Backend did not return game_id!");
        return;
      }

      navigate("/board", { state: { gameId: res.data.game_id, gameData: res.data } });
    } catch (err) {
      console.error("Failed to start new game:", err);
      alert("Could not start a new game");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeGame = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(" Resuming game:", res.data);

      if (!res.data || !res.data.id) {
        alert("No active game data returned");
        return;
      }

      navigate("/board", { state: { gameId: res.data.id, gameData: res.data } });
    } catch (err) {
      if (err.response?.status === 404) {
        alert("No active game found!");
      } else {
        console.error("Failed to resume game:", err);
        alert("Could not resume game");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered menu-bg">
      <h1>Game Menu</h1>

      {loading ? (
        <p>Loading game...</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 mt-8">
          <button onClick={handleNewGame}>Start Game</button>
          <button onClick={handleResumeGame}>Resume Game</button>
        </div>
      )}
    </div>
  );
}

export default GameMenu;
