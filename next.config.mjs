/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/locations',
        destination: '/destinations',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
