import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const LogoButton = () => {
  const navigate = useNavigate();
  const size = 30;

  return (
    <Button
      className="cursor-pointer p-0 m-0 fixed top-6 left-6 z-1000"
      variant="ghost"
      onClick={() => navigate("/")}
    >
      <div className="bg-black p-2 rounded-full hover:opacity-80 transition-opacity">
        <img
          alt="trailframes logo"
          height={size}
          src="../../public/trail-frame-logo-white.svg"
          width={size}
        />
      </div>
    </Button>
  );
};

export default LogoButton;
