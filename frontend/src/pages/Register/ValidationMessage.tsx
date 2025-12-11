import type { ReactNode } from "react";

interface ValidationMessageProps {
  isValid: boolean;
  children: ReactNode;
  disabledStyle?: boolean;
}

export function ValidationMessage({
  isValid,
  children,
  disabledStyle = false,
}: ValidationMessageProps) {
  return (
    <span className={`block ${disabledStyle ? "text-gray-400" : ""}`}>
      <span className={isValid ? "text-green-600" : ""}>
        {isValid ? "✓" : "○"}
      </span>{" "}
      {children}
    </span>
  );
}
