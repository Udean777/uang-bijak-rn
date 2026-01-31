import { stripUndefined } from "../src/utils/firestoreUtils";

describe("firestoreUtils", () => {
  describe("stripUndefined", () => {
    it("should remove undefined values from an object", () => {
      const input = {
        a: 1,
        b: undefined,
        c: "test",
        d: null,
      };
      const expected = {
        a: 1,
        c: "test",
        d: null,
      };
      expect(stripUndefined(input)).toEqual(expected);
    });

    it("should recursively remove undefined values", () => {
      const input = {
        a: {
          b: undefined,
          c: 2,
        },
        d: [{ e: undefined, f: 3 }, { g: 4 }],
      };
      const expected = {
        a: {
          c: 2,
        },
        d: [{ f: 3 }, { g: 4 }],
      };
      expect(stripUndefined(input)).toEqual(expected);
    });

    it("should preserve other falsy values", () => {
      const input = {
        a: 0,
        b: false,
        c: "",
        d: null,
        e: undefined,
      };
      const expected = {
        a: 0,
        b: false,
        c: "",
        d: null,
      };
      expect(stripUndefined(input)).toEqual(expected);
    });

    it("should handle non-object inputs", () => {
      expect(stripUndefined(1)).toBe(1);
      expect(stripUndefined("test")).toBe("test");
      expect(stripUndefined(null)).toBe(null);
      expect(stripUndefined(undefined)).toBe(undefined);
    });
  });
});
