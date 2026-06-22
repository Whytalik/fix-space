import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { StatisticsQueryDto } from "../dto/requests/statistics-query.dto";

describe("StatisticsQueryDto", () => {
  it("passes with all fields empty (all optional)", async () => {
    const dto = plainToInstance(StatisticsQueryDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("passes with valid spaceId and date range", async () => {
    const dto = plainToInstance(StatisticsQueryDto, {
      spaceId: "550e8400-e29b-41d4-a716-446655440000",
      from: "2025-01-01T00:00:00.000Z",
      to: "2025-12-31T23:59:59.999Z",
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("passes with compare range included", async () => {
    const dto = plainToInstance(StatisticsQueryDto, {
      spaceId: "550e8400-e29b-41d4-a716-446655440000",
      from: "2025-01-01T00:00:00.000Z",
      to: "2025-06-30T23:59:59.999Z",
      compareFrom: "2024-01-01T00:00:00.000Z",
      compareTo: "2024-06-30T23:59:59.999Z",
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("fails with invalid spaceId (not UUID)", async () => {
    const dto = plainToInstance(StatisticsQueryDto, { spaceId: "not-a-uuid" });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === "spaceId")).toBe(true);
  });

  it("fails with invalid from date string", async () => {
    const dto = plainToInstance(StatisticsQueryDto, { from: "not-a-date" });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === "from")).toBe(true);
  });

  it("fails with invalid to date string", async () => {
    const dto = plainToInstance(StatisticsQueryDto, { to: "2025/12/31" });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === "to")).toBe(true);
  });
});
