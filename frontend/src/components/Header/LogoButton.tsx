import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { TypographyP } from "../ui/typographyP";

const LOGO_SIZE = 30;

const LogoButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      className="cursor-pointer px-2 m-0 hover:bg-transparent"
      variant="ghost"
      onClick={() => navigate("/")}
    >
      <div className="bg-black p-1.5 rounded-full">
        <img
          alt="trailframes logo"
          height={LOGO_SIZE}
          src="/svg/trail-frame-logo-white.svg"
          width={LOGO_SIZE}
        />
      </div>
      <TypographyP className="font-jersey text-2xl">TrailFrames</TypographyP>
    </Button>
  );
};

export default LogoButton;
