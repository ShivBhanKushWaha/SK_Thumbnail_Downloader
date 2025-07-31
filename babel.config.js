module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        root: ['./src'],
        alias: {
          '@src': './src',
          '@atoms': './src/components/atoms',
          '@molecules': './src/components/molecules',
          '@organisms': './src/components/organisms',
          '@screens': './src/screens',
          '@assets': './src/assets',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@themes': './src/themes',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};

// module.exports = {
//   presets: ['module:@react-native/babel-preset'],
// };