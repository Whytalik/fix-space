import { prisma } from "@fixspace/database";
import bcrypt from "bcryptjs";

const EMAIL = "loadtest@fixspace.dev";
const PASSWORD = "Password123!";

async function main() {
  const existingUser = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existingUser) {
    console.log("User already exists, skipping creation.");
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const user = await prisma.user.create({
    data: {
      email: EMAIL,
      username: `loadtest_${Date.now()}`,
      passwordHash,
      isVerified: true,
    },
  });
  console.log(`User created: ${user.id}`);

  const space = await prisma.space.create({
    data: {
      ownerId: user.id,
      name: "Load Test Space",
    },
  });
  console.log(`Space created: ${space.id}`);

  const database = await prisma.database.create({
    data: {
      spaceId: space.id,
      name: "Trades",
      title: "Trades",
    },
  });
  console.log(`Database created: ${database.id}`);

  const records = await Promise.all(
    Array.from({ length: 100 }, (_, i) =>
      prisma.record.create({
        data: {
          databaseId: database.id,
          name: `Load Test Record ${i + 1}`,
        },
      }),
    ),
  );
  console.log(`Records created: ${records.length}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
