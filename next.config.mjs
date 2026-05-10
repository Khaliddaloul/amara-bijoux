/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.youcan.store",
      },
      {
        protocol: "https",
        hostname: "cdn.youcan.shop",
      },
    ],
  },
};

export default nextConfig;
