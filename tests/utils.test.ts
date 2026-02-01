import { formatDate, formatRupiah, formatTime } from "../src/utils/index";

describe("General Utilities", () => {
  describe("formatDate", () => {
    it("should format timestamp to Indonesian date string", () => {
      const ts = new Date("2024-01-31").getTime();
      // Expectation depends on timezone, but should contain these parts
      const result = formatDate(ts);
      expect(result).toContain("Januari");
      expect(result).toContain("2024");
    });
  });

  describe("formatTime", () => {
    it("should format timestamp to HH:mm", () => {
      const ts = new Date("2024-01-31T10:30:00").getTime();
      const result = formatTime(ts);
      expect(result).toMatch(/\d{2}[:.]\d{2}/);
    });
  });

  describe("formatRupiah", () => {
    it("should format number to IDR currency", () => {
      expect(formatRupiah(1500000)).toContain("1.500.000");
      expect(formatRupiah(0)).toContain("0");
    });
  });
});
