import { Navigate, Route, Routes } from "react-router-dom";
import GamePage from "./pages/GamePage";
import LobbyPage from "./pages/LobbyPage";
import LoginPage from "./pages/LoginPage";
import MainMenuPage from "./pages/MainMenuPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/main-menu" element={<MainMenuPage />} />
      <Route path="/lobby/:gameId" element={<LobbyPage />} />
      <Route path="/game" element={<GamePage />} />
    </Routes>
  );
}
