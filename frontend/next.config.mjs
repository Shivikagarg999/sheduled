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
        destination: 'http://72.60.111.193:5000/api/:path*',
      },
    ];
  }
};

export default nextConfig;