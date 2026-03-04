/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-project.supabase.co'],
  },
  // Needed for PDF.js worker
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
