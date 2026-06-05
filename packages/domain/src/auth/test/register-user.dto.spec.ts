import { createValidator } from "../../testing";
import { RegisterUserDto } from "../dto/register-user.dto";

const validateDto = createValidator(RegisterUserDto);

const VALID = { email: "user@example.com", username: "john_doe", password: "Valid1@xx" };

describe("RegisterUserDto", () => {
  describe("email", () => {
    it("passes with valid email", async () => {
      expect(await validateDto(VALID)).not.toContain("email");
    });

    it("fails with invalid format", async () => {
      expect(await validateDto({ ...VALID, email: "invalid" })).toContain("email");
    });

    it("fails when missing", async () => {
      const { email: _email, ...rest } = VALID;
      expect(await validateDto(rest)).toContain("email");
    });
  });

  describe("username", () => {
    it("passes at min boundary (3 chars)", async () => {
      expect(await validateDto({ ...VALID, username: "abc" })).not.toContain("username");
    });

    it("fails below min boundary (2 chars)", async () => {
      expect(await validateDto({ ...VALID, username: "ab" })).toContain("username");
    });

    it("passes at max boundary (50 chars)", async () => {
      expect(await validateDto({ ...VALID, username: "a".repeat(50) })).not.toContain("username");
    });

    it("fails above max boundary (51 chars)", async () => {
      expect(await validateDto({ ...VALID, username: "a".repeat(51) })).toContain("username");
    });

    it("fails with forbidden characters (space)", async () => {
      expect(await validateDto({ ...VALID, username: "john doe" })).toContain("username");
    });
  });

  describe("password", () => {
    it("passes at min boundary (8 chars)", async () => {
      expect(await validateDto({ ...VALID, password: "Valid1@x" })).not.toContain("password");
    });

    it("fails below min boundary (7 chars)", async () => {
      expect(await validateDto({ ...VALID, password: "Valid1@" })).toContain("password");
    });

    it("passes at max boundary (128 chars)", async () => {
      const password = "Aa1@" + "x".repeat(124);
      expect(await validateDto({ ...VALID, password })).not.toContain("password");
    });

    it("fails above max boundary (129 chars)", async () => {
      const password = "Aa1@" + "x".repeat(125);
      expect(await validateDto({ ...VALID, password })).toContain("password");
    });

    it("fails without uppercase letter", async () => {
      expect(await validateDto({ ...VALID, password: "valid1@xx" })).toContain("password");
    });

    it("fails without digit", async () => {
      expect(await validateDto({ ...VALID, password: "ValidX@xx" })).toContain("password");
    });

    it("fails without special character", async () => {
      expect(await validateDto({ ...VALID, password: "Valid1xxx" })).toContain("password");
    });
  });
});
