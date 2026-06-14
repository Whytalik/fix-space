import { ForgotPasswordDto } from "../dto/requests/forgot-password.dto";
import { createValidator } from "@/testing";

const validateDto = createValidator(ForgotPasswordDto);

describe("ForgotPasswordDto", () => {
  describe("email", () => {
    it("passes with valid email", async () => {
      expect(await validateDto({ email: "user@example.com" })).not.toContain("email");
    });

    it("fails with invalid format", async () => {
      expect(await validateDto({ email: "notanemail" })).toContain("email");
    });

    it("fails when missing", async () => {
      expect(await validateDto({})).toContain("email");
    });
  });
});
