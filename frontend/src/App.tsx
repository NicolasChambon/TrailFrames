import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Callback from "./pages/Callback";
import Dashboard from "./pages/Dashboard";
import Entry from "./pages/Entry";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StravaSync from "./pages/StravaSync";

function App() {
  return (
    <Routes>
      <Route element={<Entry />} path="/" />
      <Route
        element={
          <ProtectedRoute>
            <StravaSync />
          </ProtectedRoute>
        }
        path="/strava-sync"
      />
      <Route element={<Callback />} path="/callback" />
      <Route
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
        path="/dashboard"
      />
      <Route element={<Register />} path="/register" />
      <Route element={<Login />} path="/login" />
    </Routes>
  );
}

export default App;
