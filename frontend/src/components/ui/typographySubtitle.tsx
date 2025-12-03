import { cn } from "@/lib/utils";

export function TypographySubtitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-lg font-semibold text-muted-foreground", className)}>
      {children}
    </p>
  );
}
