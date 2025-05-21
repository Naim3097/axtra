/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',          // Enables static export to /out
    trailingSlash: true,       // Keeps URLs like /about/ instead of /about
    images: {
      unoptimized: true,       // Required for static hosting (e.g., Hostinger)
    },
    reactStrictMode: true,     // Optional but recommended for dev debugging
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
  };
  
  module.exports = nextConfig;
  