import { fileURLToPath } from "url";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(__dirname, "../../");

const stubPath = "./src/lib/server-only-stub.js";

const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.INTERNAL_API_URL || "http://127.0.0.1:3000"}/:path*`,
      },
    ];
  },
  outputFileTracingRoot: monorepoRoot,
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "127.0.0.1",
  ],
  serverExternalPackages: [
    "@nestjs/common",
    "@nestjs/core",
    "@nestjs/mapped-types",
    "@nestjs/microservices",
    "@nestjs/websockets",
    "@nestjs/platform-express",
    "@nestjs/swagger",
    "nestjs-i18n",
    "class-transformer",
    "class-validator",
    "reflect-metadata",
    "express",
  ],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  reactCompiler: true,
  turbopack: {
    root: monorepoRoot,
    resolveAlias: {
      "@nestjs/common": stubPath,
      "@nestjs/core": stubPath,
      "@nestjs/mapped-types": stubPath,
      "@nestjs/microservices": stubPath,
      "@nestjs/websockets": stubPath,
      "@nestjs/platform-express": stubPath,
      "@nestjs/swagger": stubPath,
      "nestjs-i18n": stubPath,
      "class-transformer": stubPath,
      "class-validator": stubPath,
      "reflect-metadata": stubPath,
      "express": stubPath,
    },
  },
};

export default withNextIntl(nextConfig);