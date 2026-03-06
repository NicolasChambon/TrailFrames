import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "../ui/button";
import LogoButton from "./LogoButton";
import LogoutButton from "./LogoutButton";

export const HEADER_HEIGHT = 56; // in pixels

const Header = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const currentPath = location.pathname;

  return (
    <header
      className={cn(
        "sticky top-0 z-10",
        "bg-white border-b border-b-slate-200",
      )}
      style={{ height: HEADER_HEIGHT }}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto h-full px-3",
          "flex items-center justify-between",
        )}
      >
        <LogoButton />
        <div>
          {currentPath === "/login" && !isAuthenticated && (
            <Link to="/register">
              <Button variant="default">S'inscrire</Button>
            </Link>
          )}
          {currentPath === "/register" && !isAuthenticated && (
            <Link to="/login">
              <Button variant="default">Se connecter</Button>
            </Link>
          )}
          {isAuthenticated && <LogoutButton />}
        </div>
      </div>
    </header>
  );
};

export default Header;
