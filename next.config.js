/** @type {import('next').NextConfig} */

const withImages = require('next-images')

const withTM = require('next-transpile-modules')([
  'react-vant',
]);

const nextConfig = withTM(withImages({
  // 你项目中其他的 Next.js 配置
}))

module.exports = nextConfig
