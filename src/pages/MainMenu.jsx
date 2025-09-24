import { useLocation, useNavigate } from "react-router-dom";

function MainMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const playerName = location.state?.name || "Player";

  const handlePlay = () => {
    navigate("/gamemenu");
  };

  const handleExit = () => alert("Exiting Game!");

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
