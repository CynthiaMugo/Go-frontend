import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import MainMenu from "./pages/MainMenu";
import GameMenu from "./pages/GameMenu";
import Game from "./pages/Game"; // ✅ make sure this file exists

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/mainmenu" element={<MainMenu />} />
        <Route path="/gamemenu" element={<GameMenu />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
