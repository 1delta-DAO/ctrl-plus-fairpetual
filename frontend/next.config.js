/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  reactStrictMode: false,
  // Fix for warnings about cjs/esm package duplication
  // See: https://github.com/polkadot-js/api/issues/5636
  transpilePackages: [
    '**@polkadot/**',
    '@polkadot/api',
    '@polkadot/api-contract',
    '@polkadot/extension-dapp',
    '@polkadot/extension-inject',
    '@polkadot/keyring',
    '@polkadot/types',
    '@polkadot/util',
    '@polkadot/util-crypto',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/wikipedia/commons/thumb/**',
      },
    ],
  },
}

module.exports = nextConfig
