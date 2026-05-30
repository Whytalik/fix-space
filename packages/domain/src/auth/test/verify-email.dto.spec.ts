import { VerifyEmailDto } from "../dto/verify-email.dto";
import { createValidator } from "../../testing";

const validateDto = createValidator(VerifyEmailDto);

describe("VerifyEmailDto", () => {
  describe("token", () => {
    it("passes with a non-empty string", async () => {
      expect(await validateDto({ token: "valid-token-string" })).not.toContain("token");
    });

    it("fails when missing", async () => {
      expect(await validateDto({})).toContain("token");
    });

    it("fails with empty string", async () => {
      expect(await validateDto({ token: "" })).toContain("token");
    });
  });
});
