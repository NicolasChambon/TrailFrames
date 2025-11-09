
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Callback from "./pages/Callback";
import Pictures from "./pages/Pictures";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="/pictures" element={<Pictures />} />
    </Routes>
  );
}

export default App;
