"use client";

import { useNavigate } from "react-router-dom";

function GameMenu() {
  const navigate = useNavigate();

  return (
    <div className="centered menu-bg">
      <h1>Game Menu</h1>

      <div className="flex flex-col md:flex-row gap-6 mt-8">
        <button onClick={() => navigate("/board", { state: { name: "Player" } })}>
          Start Game
        </button>

        <button onClick={() => alert("Resuming your saved game...")}>
          Resume Game
        </button>
      </div>
    </div>
  );
}

export default GameMenu;
