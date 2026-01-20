import { Check, TriangleAlertIcon, X, type LucideProps } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { TypographyP } from "./ui/typographyP";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export function Toast({
  message,
  type,
}: {
  message: string;
  type: "error" | "success";
}) {
  let Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;

  if (type === "error") {
    Icon = TriangleAlertIcon;
  } else {
    Icon = Check;
  }

  return (
    <div className="flex gap-4">
      <div className="flex items-center gap-4">
        <Icon />
        <TypographyP>{message}</TypographyP>
      </div>
      <Button
        className="h-6 w-6"
        variant="ghost"
        onClick={() => toast.dismiss()}
      >
        <X />
      </Button>
    </div>
  );
}
