/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)', // applies to all routes
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin' // You can change the value as needed
          }
        ]
      }
    ]
  }
};

export default nextConfig;