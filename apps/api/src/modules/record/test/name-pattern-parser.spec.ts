import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { parseNamePattern } from "../utils/name-pattern-parser.util";

describe("NamePatternParser", () => {
  let mockTransaction: any;

  beforeEach(() => {
    mockTransaction = {
      record: {
        count: jest.fn().mockResolvedValue(10),
      },
      property: {
        findFirst: jest.fn().mockResolvedValue({ id: "prop-1" }),
      },
    };
  });

  it("should parse date tokens correctly", async () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear());
    const monthName = now.toLocaleString("en-US", { month: "long" });

    const pattern = "{{today}} - {{year}} - {{month}} - {{month_name}} - {{month_num}}";
    const result = await parseNamePattern(pattern, "db-1", mockTransaction);

    expect(result).toBe(`${day}.${month}.${year} - ${year} - ${month} - ${monthName} - ${month}`);
  });

  it("should parse count token correctly", async () => {
    const pattern = "Record #{{count}}";
    const result = await parseNamePattern(pattern, "db-1", mockTransaction);

    expect(result).toBe("Record #11");
    expect(mockTransaction.record.count).toHaveBeenCalledWith({
      where: { databaseId: "db-1" },
    });
  });

  it("should parse count with filter correctly", async () => {
    const pattern = "Order #{{count:Status=Paid}}";
    const result = await parseNamePattern(pattern, "db-1", mockTransaction);

    expect(result).toBe("Order #11");
    expect(mockTransaction.property.findFirst).toHaveBeenCalledWith({
      where: { databaseId: "db-1", name: "Status" },
    });
    expect(mockTransaction.record.count).toHaveBeenCalledWith({
      where: {
        databaseId: "db-1",
        values: {
          some: {
            propertyId: "prop-1",
            value: {
              equals: "Paid",
            },
          },
        },
      },
    });
  });
});
