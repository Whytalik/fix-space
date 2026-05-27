import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(__dirname, "../../");

const SERVER_ONLY_PACKAGES = [
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
];

const stubPath = path.resolve(__dirname, "src/lib/server-only-stub.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: monorepoRoot,
  allowedDevOrigins: ["http://localhost:3000"],
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
  webpack(config, { isServer }) {
    if (!isServer) {
      const aliases = {};
      for (const pkg of SERVER_ONLY_PACKAGES) {
        aliases[pkg] = stubPath;
      }
      config.resolve.alias = { ...config.resolve.alias, ...aliases };
    }
    return config;
  },
  turbopack: {
    root: monorepoRoot,
    resolveAlias: {},
  },
};

export default nextConfig;
