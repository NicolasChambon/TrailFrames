import { LogOutIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { TypographyP } from "./ui/typographyP";

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  return (
    <Button
      className="flex gap-0 fixed top-6 right-6 z-1000 group"
      variant="secondary"
      onClick={handleLogout}
    >
      <LogOutIcon className="shrink-0" />
      <TypographyP
        className={cn(
          `transition-all duration-300`,
          `max-w-0 ml-0 opacity-0 overflow-hidden`,
          `group-hover:max-w-xs group-hover:ml-2 group-hover:opacity-100`
        )}
      >
        Se déconnecter
      </TypographyP>
    </Button>
  );
};

export default LogoutButton;
