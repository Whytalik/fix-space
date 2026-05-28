import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { RegisterUserDto } from "./register-user.dto";

async function validateDto(data: Record<string, unknown>) {
  const dto = plainToInstance(RegisterUserDto, data);
  return validate(dto);
}

const VALID_BASE = {
  email: "user@example.com",
  password: "P@ssw0rd!",
};

describe("RegisterUserDto – username validation", () => {
  it("accepts a standard Latin username", async () => {
    const errors = await validateDto({ ...VALID_BASE, username: "john_doe" });
    const usernameErrors = errors.filter((e) => e.property === "username");
    expect(usernameErrors).toHaveLength(0);
  });

  it("accepts a Russian Cyrillic username", async () => {
    const errors = await validateDto({ ...VALID_BASE, username: "кпупукпкупукп" });
    const usernameErrors = errors.filter((e) => e.property === "username");
    expect(usernameErrors).toHaveLength(0);
  });

  it("accepts a mixed Latin and Cyrillic username", async () => {
    const errors = await validateDto({ ...VALID_BASE, username: "user_кириллица" });
    const usernameErrors = errors.filter((e) => e.property === "username");
    expect(usernameErrors).toHaveLength(0);
  });

  it("accepts a Ukrainian Cyrillic username", async () => {
    const errors = await validateDto({ ...VALID_BASE, username: "користувач" });
    const usernameErrors = errors.filter((e) => e.property === "username");
    expect(usernameErrors).toHaveLength(0);
  });

  it("accepts a username with allowed special characters", async () => {
    const errors = await validateDto({ ...VALID_BASE, username: "user-name_123" });
    const usernameErrors = errors.filter((e) => e.property === "username");
    expect(usernameErrors).toHaveLength(0);
  });

  it("rejects a username with disallowed special characters", async () => {
    const errors = await validateDto({ ...VALID_BASE, username: "user@name!" });
    const usernameErrors = errors.filter((e) => e.property === "username");
    expect(usernameErrors.length).toBeGreaterThan(0);
  });

  it("rejects a username shorter than 3 characters", async () => {
    const errors = await validateDto({ ...VALID_BASE, username: "ab" });
    const usernameErrors = errors.filter((e) => e.property === "username");
    expect(usernameErrors.length).toBeGreaterThan(0);
  });

  it("rejects a username longer than 50 characters", async () => {
    const errors = await validateDto({ ...VALID_BASE, username: "a".repeat(51) });
    const usernameErrors = errors.filter((e) => e.property === "username");
    expect(usernameErrors.length).toBeGreaterThan(0);
  });
});
