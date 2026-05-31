import { LoginUserDto } from "../dto/login-user.dto";
import { createValidator } from "../../testing";

const validateDto = createValidator(LoginUserDto);

const VALID = { email: "user@example.com", password: "anystring" };

describe("LoginUserDto", () => {
  describe("email", () => {
    it("passes with valid email", async () => {
      expect(await validateDto(VALID)).not.toContain("email");
    });

    it("fails with invalid format", async () => {
      expect(await validateDto({ ...VALID, email: "bad" })).toContain("email");
    });
  });

  describe("password", () => {
    it("passes with any string", async () => {
      expect(await validateDto(VALID)).not.toContain("password");
    });

    it("fails when missing", async () => {
      const { password: _password, ...rest } = VALID;
      expect(await validateDto(rest)).toContain("password");
    });
  });
});
