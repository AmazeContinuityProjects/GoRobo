/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // AmazeUI (@amazecontinuityprojects/amazeui) is a React Native / web hybrid
  // built on react-native-web, so it must be transpiled and react-native must
  // resolve to react-native-web on the web.
  transpilePackages: ['@amazecontinuityprojects/amazeui', 'react-native-web'],
  turbopack: {
    resolveAlias: {
      'react-native': 'react-native-web',
    },
  },
}

export default nextConfig
