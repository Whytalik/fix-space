import dotenv from "dotenv";
import path from "path";

const rootDir = path.resolve(process.cwd(), "../..");
const nodeEnv = process.env.NODE_ENV || "development";
dotenv.config({ path: path.resolve(rootDir, `.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(rootDir, ".env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/client/client.js";

const globalForPrisma = global as typeof global & { prisma?: PrismaClient };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "../generated/client/client.js";
