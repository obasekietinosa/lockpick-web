import { Routes, Route } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { ConfigurationPage } from "./pages/ConfigurationPage";
import { MultiplayerMenu } from "./pages/MultiplayerMenu";
import { JoinGamePage } from "./pages/JoinGamePage";
import { SelectPinPage } from "./pages/SelectPinPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/config" element={<ConfigurationPage />} />
      <Route path="/multiplayer" element={<MultiplayerMenu />} />
      <Route path="/join" element={<JoinGamePage />} />
      <Route path="/select-pin" element={<SelectPinPage />} />
    </Routes>
  );
}

export default App;
