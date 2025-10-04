import axios from "axios";
import { useNavigate } from "react-router-dom";

function GameMenu() {
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/game";  

  const token = localStorage.getItem("access_token"); // <-- use access_token

  const handleNewGame = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/new`,
        { board: {}, turn: "black", scores: {} }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { game_id } = res.data;
      navigate("/board", { state: { gameId: game_id } });
    } catch (err) {
      console.error("Failed to start new game:", err);
      alert("Could not start a new game");
    }
  };

  const handleResumeGame = async () => {
    try {
      const res = await axios.get(`${API_URL}/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const game = res.data;
      navigate("/board", { state: { gameId: game.id, gameData: game } });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        alert("No active game found!");
      } else {
        console.error("Failed to resume game:", err);
        alert("Could not resume game");
      }
    }
  };

  return (
    <div className="centered menu-bg">
      <h1>Game Menu</h1>

      <div className="flex flex-col md:flex-row gap-6 mt-8">
        <button onClick={handleNewGame}>Start Game</button>
        <button onClick={handleResumeGame}>Resume Game</button>
      </div>
    </div>
  );
}

export default GameMenu;
