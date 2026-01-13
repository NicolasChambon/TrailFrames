import { Routes, Route } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import MinimalLayout from "@/components/layouts/MinimalLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import { useScrollToTopOnRouteChange } from "./hooks/useScrollToTopOnRouteChange";
import Callback from "./pages/Callback";
import Dashboard from "./pages/Dashboard";
import Entry from "./pages/Entry";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StravaSync from "./pages/StravaSync";

function App() {
  useScrollToTopOnRouteChange();

  return (
    <>
      <Routes>
        <Route element={<MinimalLayout />}>
          <Route element={<Entry />} path="/" />
          <Route element={<Callback />} path="/callback" />
        </Route>

        <Route element={<DefaultLayout />}>
          <Route
            element={
              <ProtectedRoute>
                <StravaSync />
              </ProtectedRoute>
            }
            path="/strava-sync"
          />
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
        </Route>
      </Routes>
      <Toaster position="top-center" />
    </>
  );
}

export default App;
