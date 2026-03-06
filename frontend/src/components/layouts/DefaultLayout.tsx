import { Outlet } from "react-router-dom";
import Header, { HEADER_HEIGHT } from "@/components/Header";

export default function DefaultLayout() {
  return (
    <>
      <Header />
      <main
        className="flex items-center justify-center max-w-7xl mx-auto"
        style={{ minHeight: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      >
        <Outlet />
      </main>
    </>
  );
}
