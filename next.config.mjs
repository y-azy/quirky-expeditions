/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /framer-motion/,
      sideEffects: false
    });
    return config;
  },
  experimental: {},
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
