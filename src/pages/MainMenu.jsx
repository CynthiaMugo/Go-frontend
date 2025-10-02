import { useLocation, useNavigate } from "react-router-dom";

function MainMenu() {
  const navigate = useNavigate();
  // const location = useLocation();
  const playerName = localStorage.getItem("playerName") || "Player";

  const handlePlay = () => {
    navigate("/gamemenu");
  };

  const handleExit = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("playerName");
    navigate("/login");
  }

  return (
    <div className="centered text-white">
      <h1>Welcome Warrior {playerName}!</h1>

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <button onClick={handlePlay}>Play</button>
        <button onClick={handleExit}>Exit</button>
      </div>
    </div>
  );
}

export default MainMenu;
