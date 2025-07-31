import React, { useEffect } from 'react';
import { View, Image, Text } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}


const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [onFinish]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className='text-[20px] text-center mb-10  font-black text-green-700 shadow-lg shadow-black'>Welcome to Sk Designs Thumbnail Downloader</Text>
      <Image
        source={require('../assets/splash.png')}
        className="w-[280px] h-[270px] rounded-[20px] shadow-lg bg-white border border-gray-300"
        resizeMode="cover"
      />
    </View>
  );
};

export default SplashScreen;
