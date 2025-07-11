/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://sheduled-8umy.onrender.com/api/:path*',
      },
    ];
  }
};

export default nextConfig;