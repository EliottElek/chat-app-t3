const { env } = require("./src/server/env");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["st.depositphotos.com", "cdn.pixabay.com", "localhost"],
  },
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
