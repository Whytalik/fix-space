import { fileURLToPath } from "url";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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
  experimental: {
  },
  reactCompiler: true,
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
    resolveAlias: {
      "@nestjs/common": "./src/lib/server-only-stub.js",
      "@nestjs/core": "./src/lib/server-only-stub.js",
      "@nestjs/mapped-types": "./src/lib/server-only-stub.js",
      "@nestjs/microservices": "./src/lib/server-only-stub.js",
      "@nestjs/websockets": "./src/lib/server-only-stub.js",
      "@nestjs/platform-express": "./src/lib/server-only-stub.js",
      "@nestjs/swagger": "./src/lib/server-only-stub.js",
      "nestjs-i18n": "./src/lib/server-only-stub.js",
      "class-transformer": "./src/lib/server-only-stub.js",
      "class-validator": "./src/lib/server-only-stub.js",
      "reflect-metadata": "./src/lib/server-only-stub.js",
      "express": "./src/lib/server-only-stub.js",
    },
  },
};

export default withNextIntl(nextConfig);
