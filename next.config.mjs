/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emits a self-contained .next/standalone build (server + only the
  // node_modules it actually needs) so the Docker runtime image can be
  // small instead of shipping the full node_modules tree.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        // Scoped to S3 virtual-hosted-style URLs (the pattern our own
        // uploads use) instead of the entire amazonaws.com domain, which
        // would let the image optimizer be used to fetch arbitrary AWS
        // service endpoints.
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
