import { useLocation, useNavigate } from "react-router-dom";

function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const playerName = location.state?.name || "Player";

  return (
    <div className="centered game-bg text-white">
      <h1>Welcome, {playerName}!</h1>

      <div className="grid grid-cols-8 gap-2 bg-gray-800 p-4 rounded-lg shadow-lg mt-6">
        {Array.from({ length: 64 }).map((_, index) => (
          <div
            key={index}
            className="w-12 h-12 bg-gray-600 hover:bg-gray-500 rounded-md"
          />
        ))}
      </div>

      <div className="flex gap-6 mt-10">
        <button onClick={() => navigate("/mainmenu")}>Exit to Menu</button>
        <button onClick={() => alert("Save functionality coming soon!")}>
          Save Game
        </button>
      </div>
    </div>
  );
}

export default Game;
