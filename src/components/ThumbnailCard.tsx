import React from 'react';
import { View, Image } from 'react-native';

type Props = {
  uri: string;
};

const ThumbnailCard: React.FC<Props> = ({ uri }) => {
  return (
    <View className="w-1/2 p-0.5">
      <View className="items-center rounded-[5px] bg-white">
        <Image
          source={{ uri }}
          className="w-full h-[120px] rounded-[5px]"
          resizeMode="cover"
        />
      </View>
    </View>
  );
};


export default ThumbnailCard;

