import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import MinimalLayout from "@/components/layouts/MinimalLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import { useScrollToTopOnRouteChange } from "./hooks/useScrollToTopOnRouteChange";
import { useToastFromUrl } from "./hooks/useToastFromUrl";
import Callback from "./pages/Callback";
import Dashboard from "./pages/Dashboard";
import Entry from "./pages/Entry";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StravaSync from "./pages/StravaSync";
import { useAuthStore } from "./stores/authStore";

function App() {
  useScrollToTopOnRouteChange();
  useToastFromUrl();

  // Check authentication status on app load
  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  return (
    <>
      <Routes>
        <Route element={<MinimalLayout />}>
          <Route element={<Entry />} path="/" />
          <Route
            element={
              <ProtectedRoute>
                <Callback />
              </ProtectedRoute>
            }
            path="/callback"
          />
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
