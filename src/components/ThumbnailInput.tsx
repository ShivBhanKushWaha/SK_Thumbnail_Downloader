import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

interface Props {
  url: string;
  setUrl: (url: string) => void;
  onGenerate: () => void;
}

const isValidYoutubeUrl = (url: string): boolean => {
  const regex =
    /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
  return regex.test(url);
};

const ThumbnailInput: React.FC<Props> = ({ url, setUrl, onGenerate }) => {
  const isValid = isValidYoutubeUrl(url);

  return (
    <View className="flex flex-row items-center mb-4 gap-2">
      <TextInput
        className={`flex-1 rounded-lg px-4 py-4 text-black border-2 ${
          url.length === 0 ? 'border-red-500' : isValid ? 'border-green-500' : 'border-red-500'
        }`}
        placeholder="Enter YouTube URL"
        placeholderTextColor="gray"
        value={url}
        onChangeText={setUrl}
      />
      {/* <TouchableOpacity
        onPress={onGenerate}
        className="bg-blue-600 px-4 py-2 rounded-lg"
      >
        <Text className="text-white font-semibold">Download</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default ThumbnailInput;
