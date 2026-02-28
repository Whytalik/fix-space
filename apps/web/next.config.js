/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['http://localhost:3000'],
  transpilePackages: ['@nucleus/ui', '@nucleus/domain'],
};

export default nextConfig;
