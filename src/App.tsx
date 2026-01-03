import { Routes, Route, useLocation } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { ConfigurationPage } from "./pages/ConfigurationPage";
import { MultiplayerMenu } from "./pages/MultiplayerMenu";
import { JoinGamePage } from "./pages/JoinGamePage";
import { SelectPinPage } from "./pages/SelectPinPage";
import { GamePage } from "./pages/GamePage";
import { MultiplayerGamePage } from "./pages/MultiplayerGamePage";

// Wrapper to decide which Game Page to show
const GamePageWrapper = () => {
    const location = useLocation();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isMultiplayer = (location.state as any)?.mode === "multiplayer";

    return isMultiplayer ? <MultiplayerGamePage /> : <GamePage />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/config" element={<ConfigurationPage />} />
      <Route path="/multiplayer" element={<MultiplayerMenu />} />
      <Route path="/join" element={<JoinGamePage />} />
      <Route path="/select-pin" element={<SelectPinPage />} />
      <Route path="/game" element={<GamePageWrapper />} />
    </Routes>
  );
}

export default App;
