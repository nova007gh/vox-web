/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate, s-maxage=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
