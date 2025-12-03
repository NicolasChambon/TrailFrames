import { Routes, Route } from "react-router-dom";
import Callback from "./pages/Callback";
import Entry from "./pages/Entry";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Pictures from "./pages/Pictures";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>
      <Route element={<Entry />} path="/" />
      <Route element={<Home />} path="/home" />
      <Route element={<Callback />} path="/callback" />
      <Route element={<Pictures />} path="/pictures" />
      <Route element={<Register />} path="/register" />
      <Route element={<Login />} path="/login" />
    </Routes>
  );
}

export default App;
