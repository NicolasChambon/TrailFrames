import { Outlet } from "react-router-dom";

export default function MinimalLayout() {
  return (
    <main className="min-h-screen flex items-center justify-center max-w-7xl mx-auto">
      <Outlet />
    </main>
  );
}
