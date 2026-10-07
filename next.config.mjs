/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "@tanstack/react-query"],
  },
  images: {
    domains: ["images.unsplash.com", "via.placeholder.com"],
  },
};

export default nextConfig;
