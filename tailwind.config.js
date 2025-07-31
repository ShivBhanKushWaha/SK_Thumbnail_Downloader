const colors = require('./src/assets/theme/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  assets: ['./src/fonts/*'],
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './src/screens/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require("nativewind/preset")],
   theme: {
    extend: {
      colors:colors,
      fontFamily: {
        'junegull-Regular': ['junegull-Regular'],
        'Proxima-Nova-Light': ['Proxima-Nova-Light'],
        'Proxima-Nova-Regular': ['Proxima-Nova-Regular'],
        'Proxima-Nova-Medium': ['Proxima-Nova-Medium'],
        'Proxima-Nova-Semibold': ['Proxima-Nova-Semibold'],
        'Proxima-Nova-Bold': ['Proxima-Nova-Bold'],
        'Proxima-Nova-Alt-Regular': ['Proxima-Nova-Alt-Regular'],
        'Figtree-Light': ['Figtree-Light'],
        'Figtree-Regular': ['Figtree-Regular'],
        'Figtree-Medium': ['Figtree-Medium'],
        'Figtree-SemiBold': ['Figtree-SemiBold'],
        'Figtree-Bold': ['Figtree-Bold'],
        'Figtree-ExtraBold': ['Figtree-ExtraBold'],
        'PTSans-Bold': ['PTSans-Bold'],
        'Nunito-Regular': ['Nunito-Regular'],
        'Nunito-Black': ['Nunito-Black'],
        'Nunito-ExtraBold': ['Nunito-ExtraBold'],
        'Nunito-Bold': ['Nunito-Bold'],
        'Nunito-SemiBold': ['Nunito-SemiBold'],
        'Nunito-Medium': ['Nunito-Medium'],
        'Nunito-Light': ['Nunito-Light'],
        'Nunito-ExtraLight': ['Nunito-ExtraLight'],
      },
    },
  },
  plugins: [],
}