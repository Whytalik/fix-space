import dotenv from "dotenv";
import path from "path";

const rootDir = path.resolve(process.cwd(), "../..");
const nodeEnv = process.env.NODE_ENV || "development";

dotenv.config({
  path: path.resolve(rootDir, `.env.${nodeEnv}`),
});
dotenv.config({
  path: path.resolve(rootDir, ".env"),
});

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/client/index.js";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// Create the Pool specifically for the adapter
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

// Pass the pool to the adapter
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "../generated/client/index.js";
