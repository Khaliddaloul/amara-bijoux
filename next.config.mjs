/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.youcan.shop" },
      { protocol: "https", hostname: "**.youcan.shop" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.youcan.store" },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

export default nextConfig;
