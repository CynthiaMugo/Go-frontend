import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import MainMenu from "./pages/MainMenu";
import GameMenu from "./pages/GameMenu";
import Game from "./pages/Game";
import GoBoard from "./pages/Go-board"; // make sure filename is exactly GoBoard.jsx

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/mainmenu" element={<MainMenu />} />
        <Route path="/gamemenu" element={<GameMenu />} />
        <Route path="/game" element={<Game />} />
        <Route path="/board" element={<GoBoard />} /> 
      </Routes>
    </Router>
  );
}

export default App;
