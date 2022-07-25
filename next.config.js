const { env } = require("./src/server/env");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/", // Notice the slash at the end
        destination: "/rooms",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
