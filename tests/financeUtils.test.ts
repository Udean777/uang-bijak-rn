import { calculateSafeDailyLimit, getSafeStatus } from "../src/utils/financeUtils";

describe("Finance Utils", () => {
  describe("calculateSafeDailyLimit", () => {
    it("should calculate correctly with normal values", () => {
      // 3M balance - 1M bills = 2M available. 2M / 20 days = 100k/day
      expect(calculateSafeDailyLimit(3000000, 1000000, 20)).toBe(100000);
    });

    it("should return 0 if bills exceed balance", () => {
      expect(calculateSafeDailyLimit(1000000, 2000000, 10)).toBe(0);
    });

    it("should handle division by zero (or less)", () => {
      expect(calculateSafeDailyLimit(1000000, 0, 0)).toBe(1000000);
      expect(calculateSafeDailyLimit(1000000, 0, -5)).toBe(1000000);
    });
  });

  describe("getSafeStatus", () => {
    it("should return 'safe' for limit >= 100k", () => {
      expect(getSafeStatus(150000)).toBe("safe");
      expect(getSafeStatus(100000)).toBe("safe");
    });

    it("should return 'warning' for limit between 50k and 100k", () => {
      expect(getSafeStatus(75000)).toBe("warning");
      expect(getSafeStatus(50000)).toBe("warning");
    });

    it("should return 'danger' for limit < 50k", () => {
      expect(getSafeStatus(49000)).toBe("danger");
      expect(getSafeStatus(0)).toBe("danger");
    });
  });
});
