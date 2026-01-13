import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { TypographyP } from "./ui/typographyP";

export const HEADER_HEIGHT = 56; // in pixels

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const logoSize = 30;

  return (
    <header
      className={cn(
        "sticky top-0 z-10",
        "bg-white border-b border-b-slate-200"
      )}
      style={{ height: HEADER_HEIGHT }}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto h-full px-3",
          "flex items-center justify-between"
        )}
      >
        <Button
          className="cursor-pointer px-2 m-0 hover:bg-transparent"
          variant="ghost"
          onClick={() => navigate("/")}
        >
          <div className="bg-black p-1.5 rounded-full">
            <img
              alt="trailframes logo"
              height={logoSize}
              src="/svg/trail-frame-logo-white.svg"
              width={logoSize}
            />
          </div>
          <TypographyP className="font-jersey text-2xl">
            TrailFrames
          </TypographyP>
        </Button>
        <div>
          {currentPath === "/login" && (
            <Link to="/register">
              <Button variant="default">S'inscrire</Button>
            </Link>
          )}
          {currentPath === "/register" && (
            <Link to="/login">
              <Button variant="default">Se connecter</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
