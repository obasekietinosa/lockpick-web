import { Routes, Route } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { ConfigurationPage } from "./pages/ConfigurationPage";
import { MultiplayerMenu } from "./pages/MultiplayerMenu";
import { JoinGamePage } from "./pages/JoinGamePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/config" element={<ConfigurationPage />} />
      <Route path="/multiplayer" element={<MultiplayerMenu />} />
      <Route path="/join" element={<JoinGamePage />} />
    </Routes>
  );
}

export default App;
