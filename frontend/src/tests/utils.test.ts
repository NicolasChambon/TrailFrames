import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const booleanCondition = true;
    const result = cn(
      "base-class",
      !booleanCondition && "conditional-class",
      "another-class"
    );
    expect(result).toBe("base-class another-class");
  });

  it("should merge tailwind classes with conflicts", () => {
    // twMerge should keep the last class when there's a conflict
    const result = cn("p-4", "p-8");
    expect(result).toBe("p-8");
  });

  it("should handle undefined and null values", () => {
    const result = cn("base-class", undefined, null, "valid-class");
    expect(result).toBe("base-class valid-class");
  });

  it("should handle empty strings", () => {
    const result = cn("", "class-1", "", "class-2");
    expect(result).toBe("class-1 class-2");
  });

  it("should handle arrays of classes", () => {
    const result = cn(["class-1", "class-2"], "class-3");
    expect(result).toBe("class-1 class-2 class-3");
  });

  it("should handle objects with boolean values", () => {
    const result = cn({
      active: true,
      disabled: false,
      visible: true,
    });
    expect(result).toBe("active visible");
  });

  it("should handle complex tailwind merging scenarios", () => {
    const result = cn(
      "px-4 py-2 bg-blue-500",
      "px-8", // should override px-4
      "hover:bg-red-500"
    );
    expect(result).toBe("py-2 bg-blue-500 px-8 hover:bg-red-500");
  });
});
