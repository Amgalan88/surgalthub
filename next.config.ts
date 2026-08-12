import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admin uploads (course covers, lesson media) go straight to Cloudinary.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
