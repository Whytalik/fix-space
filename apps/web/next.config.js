import createNextIntlPlugin from 'next-intl/plugin';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(__dirname, '../../');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: monorepoRoot,
  allowedDevOrigins: ['http://localhost:3000'],
  serverExternalPackages: [
    '@nestjs/common',
    '@nestjs/mapped-types',
    '@nestjs/microservices',
    '@nestjs/websockets',
    'class-transformer',
    'class-validator',
    'nestjs-i18n',
    'reflect-metadata',
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        'fs/promises': false,
        async_hooks: false,
        perf_hooks: false,
        repl: false,
        graphql: false,
        hbs: false,
        net: false,
        tls: false,
        dns: false,
      };
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        '@nestjs/microservices',
        '@nestjs/websockets',
        'class-transformer/storage',
      ];
    }
    return config;
  },
  turbopack: {
    root: monorepoRoot,
    resolveAlias: {},
  },
};

export default withNextIntl(nextConfig);
