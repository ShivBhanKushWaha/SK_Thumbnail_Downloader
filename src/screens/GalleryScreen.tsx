import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, PermissionsAndroid, Platform, Text, ActivityIndicator } from 'react-native';
import { CameraRoll, PhotoIdentifier } from '@react-native-camera-roll/camera-roll';
import ThumbnailCard from '@src/components/ThumbnailCard';
import { useFocusEffect } from '@react-navigation/native';

const GalleryScreen: React.FC = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [after, setAfter] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(true);
const [loading, setLoading] = useState(false);


  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const loadAllPhotos = useCallback(async () => {
  const hasPermission = await requestPermission();
  if (!hasPermission) {
    setError('Permission denied');
    return;
  }

  setLoading(true);
  let allPhotos: string[] = [];
  let afterCursor: string | undefined = undefined;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const result = await CameraRoll.getPhotos({
        first: 100,
        assetType: 'Photos',
        after: afterCursor,
      });

      const uris = result.edges.map((edge: PhotoIdentifier) => edge.node.image.uri);
      allPhotos = [...allPhotos, ...uris];

      afterCursor = result.page_info.end_cursor;
      hasNextPage = result.page_info.has_next_page;
    }

    setPhotos(allPhotos);
  } catch (err: any) {
    console.error('Error loading all photos:', err);
    setError('Failed to load all photos');
  } finally {
    setLoading(false);
  }
}, []);


useFocusEffect(
  useCallback(() => {
    loadAllPhotos();
  }, [])
);

 return (
  <View className="flex-1 bg-white p-4 justify-center items-center">
    {loading ? (
      <ActivityIndicator size="large" color="green" />
    ) : error ? (
      <Text className="text-red-500">{error}</Text>
    ) : (
      <FlatList
        data={photos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <ThumbnailCard uri={item} />}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        ListEmptyComponent={<Text className="text-center">No images found.</Text>}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    )}
  </View>
);

};

export default GalleryScreen;
