/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SILICONFLOW_BASE_URL: process.env.SILICONFLOW_BASE_URL,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/siliconflow/:path*',
        destination: 'https://api.siliconflow.cn/v1/:path*',
      },
    ]
  },
  images: {
    domains: ['api.siliconflow.cn'],
  },
}

module.exports = nextConfig
