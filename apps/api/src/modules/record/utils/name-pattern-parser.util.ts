import type { Prisma } from "@fixspace/database";

export async function parseNamePattern(pattern: string, databaseId: string, transaction: Prisma.TransactionClient): Promise<string> {
  let result = pattern;
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  const monthName = now.toLocaleString("en-US", { month: "long" });
  const quarter = Math.floor((now.getMonth() + 3) / 3).toString();

  result = result.replace(/{{today}}/g, `${day}.${month}.${year}`);
  result = result.replace(/{{month}}/g, monthName);
  result = result.replace(/{{month_num}}/g, month);
  result = result.replace(/{{year}}/g, year);
  result = result.replace(/{{quarter}}/g, quarter);

  if (result.includes("{{count}}")) {
    const count = await transaction.record.count({
      where: { databaseId },
    });
    result = result.replace(/{{count}}/g, (count + 1).toString());
  }

  const countFilterRegex = /{{count:([^=]+)=([^}]+)}}/g;
  let match;
  while ((match = countFilterRegex.exec(result)) !== null) {
    const propertyName = match[1]?.trim();
    const propertyValue = match[2]?.trim();

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
        result = result.replace(match[0], (count + 1).toString());
      } else {
        result = result.replace(match[0], "?");
      }
    }
  }

  return result;
}
