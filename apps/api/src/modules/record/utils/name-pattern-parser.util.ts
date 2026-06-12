import type { Prisma } from "@fixspace/database";

export async function parseNamePattern(pattern: string, databaseId: string, transaction: Prisma.TransactionClient): Promise<string> {
  let result = pattern;
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());

  const monthName = now.toLocaleString("en-US", { month: "long" });
  const quarter = Math.floor((now.getMonth() + 3) / 3).toString();

  result = result.replace(/{{\s*day\s*}}/gi, day);
  result = result.replace(/{{\s*today\s*}}/gi, `${day}.${month}.${year}`);
  result = result.replace(/{{\s*month\s*}}/gi, monthName);
  result = result.replace(/{{\s*month_num\s*}}/gi, month);
  result = result.replace(/{{\s*year\s*}}/gi, year);
  result = result.replace(/{{\s*quarter\s*}}/gi, quarter);

  if (result.match(/{{\s*count\s*}}/i)) {
    const count = await transaction.record.count({
      where: { databaseId },
    });
    result = result.replace(/{{\s*count\s*}}/gi, (count + 1).toString());
  }

  const countFilterRegex = /{{\s*count\s*:\s*([^=]+)\s*=\s*([^}]+)\s*}}/gi;
  while (true) {
    const currentMatch = countFilterRegex.exec(result);
    if (!currentMatch) break;

    const propertyName = currentMatch[1]?.trim();
    const propertyValue = currentMatch[2]?.trim();

    if (propertyName && propertyValue) {
      const property = await transaction.property.findFirst({
        where: { databaseId, name: propertyName },
      });

      if (property) {
        const count = await transaction.record.count({
          where: {
            databaseId,
            values: {
              some: {
                propertyId: property.id,
                value: {
                  equals: propertyValue as Prisma.InputJsonValue,
                },
              },
            },
          },
        });
        result = result.replace(currentMatch[0], (count + 1).toString());
      } else {
        result = result.replace(currentMatch[0], "?");
      }
    }
    countFilterRegex.lastIndex = 0;
  }

  return result;
}
