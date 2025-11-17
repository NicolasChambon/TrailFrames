import { cn } from "@/lib/utils";

export function TypographyP({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}>
      {children}
    </h2>
  );
}
