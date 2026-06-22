import { ResetPasswordDto } from "../dto/requests/reset-password.dto";
import { createValidator } from "@/testing";

const validateDto = createValidator(ResetPasswordDto);

const VALID = { token: "some-reset-token", newPassword: "Valid1@xx" };

describe("ResetPasswordDto", () => {
  describe("token", () => {
    it("passes with a non-empty string", async () => {
      expect(await validateDto(VALID)).not.toContain("token");
    });

    it("fails when missing", async () => {
      const { token: _token, ...rest } = VALID;
      expect(await validateDto(rest)).toContain("token");
    });
  });

  describe("newPassword", () => {
    it("passes with valid password", async () => {
      expect(await validateDto(VALID)).not.toContain("newPassword");
    });

    it("fails below min boundary (7 chars)", async () => {
      expect(await validateDto({ ...VALID, newPassword: "Valid1@" })).toContain("newPassword");
    });

    it("fails without uppercase letter", async () => {
      expect(await validateDto({ ...VALID, newPassword: "valid1@xx" })).toContain("newPassword");
    });

    it("fails when missing", async () => {
      const { newPassword: _newPassword, ...rest } = VALID;
      expect(await validateDto(rest)).toContain("newPassword");
    });
  });
});
