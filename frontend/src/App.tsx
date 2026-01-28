import { useEffect } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import MinimalLayout from "@/components/layouts/MinimalLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import { useScrollToTopOnRouteChange } from "./hooks/useScrollToTopOnRouteChange";
import { showErrorToast } from "./lib/toast-helpers";
import Callback from "./pages/Callback";
import Dashboard from "./pages/Dashboard";
import Entry from "./pages/Entry";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StravaSync from "./pages/StravaSync";
import { useAuthStore } from "./stores/authStore";

function App() {
  useScrollToTopOnRouteChange();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check authentication status on app load
  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  // Centralized toast handling for query parameters
  useEffect(() => {
    const toastParam = searchParams.get("toast");

    if (toastParam === "session-expired") {
      showErrorToast("Votre session a expiré. Veuillez vous reconnecter.");
      searchParams.delete("toast");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
