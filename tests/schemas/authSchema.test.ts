import { loginSchema, registerSchema } from "@/src/schemas/authSchema";

describe("Auth Schema Validation", () => {
  describe("Login Schema", () => {
    it("should validate correct email and password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Format email tidak valid",
        );
      }
    });

    it("should reject empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("Register Schema", () => {
    it("should reject short name", () => {
      const result = registerSchema.safeParse({
        fullName: "Jo",
        email: "test@example.com",
        password: "password123",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toContain("minimal 3 karakter");
      }
    });

    it("should reject short password", () => {
      const result = registerSchema.safeParse({
        fullName: "John Doe",
        email: "test@example.com",
        password: "123",
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toContain("minimal 6 karakter");
      }
    });
  });
});
