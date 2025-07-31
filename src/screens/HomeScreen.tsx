import ThumbnailInput from '@src/components/ThumbnailInput';
import { extractVideoId } from '@src/utils/extractVideoId';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  Image,
  ScrollView,
  PermissionsAndroid,
  Alert,
  Platform,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import RNFS from 'react-native-fs';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import Feather from 'react-native-vector-icons/Feather';


const HomeScreen: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [thumbnailUri, setThumbnailUri] = useState<string>('');
  const [downloads, setDownloads] = useState<string[]>([]);
const [videoId, setVideoId] = useState<string>('');
const [isThumbnailLoading, setIsThumbnailLoading] = useState<boolean>(false);
const [isDownloading, setIsDownloading] = useState<boolean>(false);


  useEffect(() => {
    loadSavedThumbnails();
  }, []);

const tryAvailableThumbnail = async (videoId: string): Promise<string> => {
  const resolutions = ['maxresdefault', 'hqdefault', 'mqdefault'];
  for (const res of resolutions) {
    const url = `https://img.youtube.com/vi/${videoId}/${res}.jpg`;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) return url;
    } catch (_) {}
  }
  return ''; // koi thumbnail nahi mila
};


  const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'App needs access to your storage to download thumbnails.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  }
  return true; // iOS doesn’t need this permission
};


const downloadThumbnail = useCallback(
  async (uri: string, videoId: string): Promise<void> => {
    if (!uri) {
      Alert.alert('Error', 'No thumbnail URL available.');
      return;
    }

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    const filename = `${videoId}.jpg`;
    const folderPath = `${RNFS.PicturesDirectoryPath}/ThumbnailDownloader`;
    const filePath = `${folderPath}/${filename}`;

    try {
      // Create folder if it doesn't exist
      const folderExists = await RNFS.exists(folderPath);
      if (!folderExists) {
        await RNFS.mkdir(folderPath);
      }

      // Download the image
      const downloadResult = await RNFS.downloadFile({
        fromUrl: uri,
        toFile: filePath,
      }).promise;

      if (downloadResult.statusCode === 200) {
  if (Platform.OS === 'android') {
    await RNFS.scanFile(filePath);
  }

  setDownloads((prev) => [filePath, ...prev]); // 👈 add instead of replace
}
 else {
        throw new Error('Failed to download image');
      }
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Error', 'Failed to download thumbnail');
    }
  },
  [setDownloads]
);

const loadSavedThumbnails = async (): Promise<void> => {
  try {
    const folderPath = `${RNFS.PicturesDirectoryPath}/SkDesigns`;

    const exists = await RNFS.exists(folderPath);
    if (!exists) {
      // Folder hi nahi mila, so array ko clear karo
      setDownloads([]);
      return;
    }

    const files = await RNFS.readDir(folderPath);

    // Sirf valid aur existing .jpg files ko filter karo
    const validFiles: string[] = [];

    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.jpg')) {
        const exists = await RNFS.exists(file.path);
        if (exists) {
          validFiles.push(file.path);
        }
      }
    }
    setDownloads(validFiles.reverse());
  } catch (error) {
    console.error('Thumbnail loading error:', error);
    setDownloads([]); // error case me bhi clear karo
  }
};



useEffect(() => {
  loadSavedThumbnails();
}, []);


const handleGenerate = useCallback(async (): Promise<void> => {
  const extractedId = extractVideoId(url);
  if (extractedId) {
    const fallbackThumbnail = await tryAvailableThumbnail(extractedId); // 👈
    if (fallbackThumbnail) {
      setThumbnailUri(fallbackThumbnail);
      setVideoId(extractedId);
    } else {
      Alert.alert('Thumbnail not found', 'No thumbnail found for this video.');
    }
  } else {
    Alert.alert('Invalid URL', 'Please enter a valid YouTube link.');
  }
}, [url]);


useEffect(() => {
  ReceiveSharingIntent.getReceivedFiles(
    (files) => {
      if (files && files.length > 0) {
        const sharedLink = files[0].weblink || files[0].text;
        if (sharedLink && sharedLink.includes('youtube.com')) {
          console.error('Received YouTube link:', sharedLink);

          // Optional: Extract video ID
          const videoId = extractVideoId(sharedLink);
          console.error('Extracted Video ID:', videoId);

          // TODO: Call downloader or UI updater here
        }
      }
    },
    (error) => {
      console.error('Error receiving file', error);
    },
    'youtubeLinkHandler'
  );

  return () => {
    ReceiveSharingIntent.clearReceivedFiles();
  };
}, []);

 const handleUrlChange = async (text: string) => {
    setUrl(text);
    const id = extractVideoId(text);
    if (id) {
      setIsThumbnailLoading(true);
      const fallback = await tryAvailableThumbnail(id);
      if (fallback) {
        setThumbnailUri(fallback);
        setVideoId(id);
      }
      setIsThumbnailLoading(false);
    }
  };

  return (
    <ScrollView className="p-4 bg-white">
      <Text className="text-[14px] font-bold text-blue-900 mb-3 text-center bg-red-200 px-3 py-5 rounded-2xl">
        Sk Designs Thumbnail Downloader
      </Text>

      <ThumbnailInput url={url} setUrl={handleUrlChange} onGenerate={handleGenerate} />

      {(isThumbnailLoading || thumbnailUri !== '') && (
        <>
          {isThumbnailLoading ? (
            <View className="w-full h-[200px] justify-center items-center mb-4">
              <ActivityIndicator size="large" color="red" />
            </View>
          ) : (
            <Image
              source={{ uri: thumbnailUri }}
              className="w-full h-[200px] resize-contain mb-4"
            />
          )}

          <View className="flex-row justify-between mb-5">
            <TouchableOpacity
              onPress={() => {
                setUrl('');
                setThumbnailUri('');
                setVideoId('');
              }}
              className="bg-red-500 flex-1 mr-2 p-3 rounded-md items-center flex-row justify-center gap-2"
            >
              <Feather name="x-circle" size={20} color="white" />
              <Text className="text-white font-bold">Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
  onPress={async () => {
    if (!thumbnailUri || !videoId) {
      Alert.alert('Error', 'No thumbnail to download');
      return;
    }

    setIsDownloading(true); // start loading
    await downloadThumbnail(thumbnailUri, videoId);
    setIsDownloading(false); // stop loading
    setThumbnailUri('');
setVideoId('');
setUrl('');

  }}
  className="bg-black flex-1 ml-2 p-3 rounded-md items-center flex-row justify-center gap-2"
>
  {isDownloading ? (
    <ActivityIndicator size="small" color="white" />
  ) : (
    <>
      <Feather name="download" size={20} color="white" />
      <Text className="text-white font-bold">Download</Text>
    </>
  )}
</TouchableOpacity>

          </View>
        </>
      )}

      {downloads.length === 0 ? (
        <Text className="text-gray-500 mb-4 text-center mt-4">
          No thumbnails downloaded yet.
        </Text>
      ) : (
        <>
          <View className="flex-row justify-between items-center my-4">
            <Text className="text-green-500 text-lg font-semibold">Downloaded Thumbnails</Text>
            <TouchableOpacity
              onPress={() => setDownloads([])}
              className="bg-red-500 px-3 py-1 rounded-md"
            >
              <Text className="text-white text-sm">Clear</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {downloads.map((path, index) => (
              <TouchableOpacity key={index} className="w-[48%] mb-3">
                <Image
                  source={{ uri: `file://${path}` }}
                  onError={() => {
                    console.error('Image no longer exists:', path);
                  }}
                  className="w-full h-[120px] rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default HomeScreen;
