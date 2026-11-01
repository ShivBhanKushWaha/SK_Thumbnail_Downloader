import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
};

const ScreenHeader: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <View className="mb-4 rounded-2xl bg-red-500 px-5 py-5">
      <Text className="text-2xl font-extrabold text-white">{title}</Text>
      {subtitle ? <Text className="mt-1 text-xs text-red-100">{subtitle}</Text> : null}
    </View>
  );
};

export default ScreenHeader;
