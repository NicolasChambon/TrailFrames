import { LogOutIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "../ui/button";
import { TypographyP } from "../ui/typographyP";

const LogoutButton = () => {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    logout();
  };

  return (
    <Button className="gap-0 mx-2 group" onClick={handleLogout}>
      <LogOutIcon />
      <TypographyP
        className={cn(
          `transition-all duration-300`,
          `max-w-0 ml-0 opacity-0 overflow-hidden`,
          `group-hover:max-w-xs group-hover:ml-2 group-hover:opacity-100`,
        )}
      >
        Se déconnecter
      </TypographyP>
    </Button>
  );
};

export default LogoutButton;
