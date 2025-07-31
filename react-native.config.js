module.exports = {
  project: {
    ios: {},
    android: {}, // grouped into "project"
  },
  assets: ["./src/assets/fonts/"], // stays the same
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null,
      },
    },
  },
};
// module.exports = {
//   assets: ['./node_modules/react-native-vector-icons/Fonts'],
// };
