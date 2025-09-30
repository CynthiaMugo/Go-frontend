"use client";

import { useLocation, useNavigate } from "react-router-dom";

function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const playerName = location.state?.name || "Player";

  return (
    <div className="centered game-bg">
      <h1 className="game-title">Welcome, {playerName}!</h1>

      <div className="game-grid">
        {Array.from({ length: 64 }).map((_, index) => (
          <div key={index} className="grid-cell" />
        ))}
      </div>

      <div className="game-buttons">
        <button className="menu-btn exit-btn" onClick={() => navigate("/mainmenu")}>
          Exit to Menu
        </button>
        <button className="menu-btn save-btn" onClick={() => alert("Save functionality coming soon!")}>
          Save Game
        </button>
      </div>
    </div>
  );
}

export default Game;
