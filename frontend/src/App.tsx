import { Routes, Route } from "react-router-dom";
import Callback from "./pages/Callback";
import Entry from "./pages/Entry";
import Login from "./pages/Login";
import Pictures from "./pages/Pictures";
import Register from "./pages/Register";
import StravaSync from "./pages/StravaSync";

function App() {
  return (
    <Routes>
      <Route element={<Entry />} path="/" />
      <Route element={<StravaSync />} path="/strava-sync" />
      <Route element={<Callback />} path="/callback" />
      <Route element={<Pictures />} path="/pictures" />
      <Route element={<Register />} path="/register" />
      <Route element={<Login />} path="/login" />
    </Routes>
  );
}

export default App;
