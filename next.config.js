/** @type {import('next').NextConfig} */

const withImages = require('next-images')

const withTM = require('next-transpile-modules')([
  'react-vant',
]);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

const nextConfig = withBundleAnalyzer(withTM(withImages({
  // 你项目中其他的 Next.js 配置
})))

module.exports = nextConfig
