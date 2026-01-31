import { cn } from "../src/utils/cn";

describe("cn utility", () => {
  it("should merge tailwind classes correctly", () => {
    expect(cn("px-2 py-2", "px-4")).toBe("py-2 px-4");
  });

  it("should handle conditional classes", () => {
    expect(cn("px-2", true && "py-2", false && "m-2")).toBe("px-2 py-2");
  });

  it("should handle undefined and null", () => {
    expect(cn("px-2", undefined, null)).toBe("px-2");
  });

  it("should handle objects", () => {
    expect(cn({ "bg-red-500": true, "text-white": false })).toBe("bg-red-500");
  });
});
