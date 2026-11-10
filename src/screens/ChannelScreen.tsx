import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import ScreenHeader from '@src/components/ScreenHeader';
import {
  ChannelInfo,
  ChannelVideo,
  fetchChannelLongVideos,
  resolveChannel,
} from '@src/utils/youtubeChannel';

const PERIODS: { label: string; months?: number }[] = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '4M', months: 4 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: '1.5Y', months: 18 },
  { label: '2Y', months: 24 },
  { label: 'All' },
];
const COUNTS: { label: string; value?: number }[] = [
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '150', value: 150 },
  { label: '200', value: 200 },
  { label: '250', value: 250 },
  { label: '300', value: 300 },
  { label: 'No limit' },
];
const PARALLEL_DOWNLOADS = 4;

const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || Platform.Version >= 33) return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

const safeFolderName = (name: string) => name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'Channel';

const downloadOne = async (videoId: string, folder: string): Promise<'saved' | 'skipped' | 'failed'> => {
  const filePath = `${folder}/${videoId}.jpg`;
  if (await RNFS.exists(filePath)) return 'skipped';

  for (const res of ['maxresdefault', 'hqdefault']) {
    const result = await RNFS.downloadFile({
      fromUrl: `https://img.youtube.com/vi/${videoId}/${res}.jpg`,
      toFile: filePath,
    }).promise;
    if (result.statusCode === 200) {
      if (Platform.OS === 'android') await RNFS.scanFile(filePath);
      return 'saved';
    }
    if (await RNFS.exists(filePath)) await RNFS.unlink(filePath);
  }
  return 'failed';
};

const Chip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({
  label,
  active,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
      active ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'
    }`}
  >
    <Text className={active ? 'text-white font-semibold' : 'text-gray-700'}>{label}</Text>
  </TouchableOpacity>
);

const ChannelScreen: React.FC = () => {
  const [link, setLink] = useState('');
  const [period, setPeriod] = useState(2); // 4M
  const [count, setCount] = useState(COUNTS.length - 1); // no limit
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [videos, setVideos] = useState<ChannelVideo[]>([]);
  const [fetching, setFetching] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, saved: 0, skipped: 0, failed: 0 });
  const cancelled = useRef(false);

  const handleFetch = async () => {
    if (!link.trim()) {
      Alert.alert('Channel link', 'Please paste a YouTube channel link.');
      return;
    }
    cancelled.current = false;
    setFetching(true);
    setVideos([]);
    setFoundCount(0);
    setChannel(null);
    setProgress({ done: 0, saved: 0, skipped: 0, failed: 0 });

    try {
      const info = await resolveChannel(link);
      setChannel(info);

      const months = PERIODS[period].months;
      let sinceDate: Date | undefined;
      if (months) {
        sinceDate = new Date();
        sinceDate.setMonth(sinceDate.getMonth() - months);
      }

      const found = await fetchChannelLongVideos(info.id, {
        sinceDate,
        maxVideos: COUNTS[count].value,
        onProgress: setFoundCount,
        isCancelled: () => cancelled.current,
      });
      setVideos(found);
      if (found.length === 0 && !cancelled.current) {
        Alert.alert('No videos', 'No long videos found for this filter.');
      }
    } catch (err: any) {
      const quota = err?.reason === 'quotaExceeded';
      Alert.alert(
        quota ? 'Daily limit reached' : 'Error',
        quota ? 'YouTube API daily quota is over. Try again tomorrow.' : err?.message ?? 'Something went wrong',
      );
    } finally {
      setFetching(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!channel || videos.length === 0) return;
    if (!(await requestStoragePermission())) {
      Alert.alert('Permission needed', 'Storage permission is required to save thumbnails.');
      return;
    }

    const folder = `${RNFS.PicturesDirectoryPath}/Thumvo/Youtube/${safeFolderName(channel.title)}`;
    await RNFS.mkdir(folder);

    cancelled.current = false;
    setDownloading(true);
    setProgress({ done: 0, saved: 0, skipped: 0, failed: 0 });

    let next = 0;
    const worker = async () => {
      while (!cancelled.current && next < videos.length) {
        const video = videos[next++];
        let outcome: 'saved' | 'skipped' | 'failed';
        try {
          outcome = await downloadOne(video.id, folder);
        } catch (_) {
          outcome = 'failed';
        }
        setProgress((p) => ({ ...p, done: p.done + 1, [outcome]: p[outcome] + 1 }));
      }
    };
    await Promise.all(Array.from({ length: PARALLEL_DOWNLOADS }, worker));
    setDownloading(false);
  };

  const total = videos.length;
  const percent = total ? Math.round((progress.done / total) * 100) : 0;
  const finished = !downloading && total > 0 && progress.done === total;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
    <ScrollView className="p-4" keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Channel" subtitle="Download thumbnails of a whole channel" />

      <TextInput
        className="rounded-lg px-4 py-4 text-black border-2 border-red-500 mb-4"
        placeholder="Paste channel link (youtube.com/@name)"
        placeholderTextColor="gray"
        value={link}
        onChangeText={setLink}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text className="text-gray-700 font-semibold mb-2">Last</Text>
      <View className="flex-row flex-wrap">
        {PERIODS.map((p, i) => (
          <Chip key={p.label} label={p.label} active={period === i} onPress={() => setPeriod(i)} />
        ))}
      </View>

      <Text className="text-gray-700 font-semibold mb-2 mt-2">Max videos</Text>
      <View className="flex-row flex-wrap">
        {COUNTS.map((c, i) => (
          <Chip key={c.label} label={c.label} active={count === i} onPress={() => setCount(i)} />
        ))}
      </View>

      <Text className="text-gray-500 text-xs mb-4">Only long videos, Shorts are skipped.</Text>

      <TouchableOpacity
        onPress={fetching ? () => { cancelled.current = true; } : handleFetch}
        disabled={downloading}
        className="bg-black p-3 rounded-md items-center flex-row justify-center gap-2 mb-4"
      >
        {fetching ? (
          <>
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white font-bold">
              Finding videos… {foundCount > 0 ? foundCount : ''} (tap to stop)
            </Text>
          </>
        ) : (
          <>
            <Feather name="search" size={20} color="white" />
            <Text className="text-white font-bold">Find videos</Text>
          </>
        )}
      </TouchableOpacity>

      {channel && !fetching && total > 0 && (
        <View className="bg-gray-100 rounded-xl p-4 mb-4">
          <Text className="text-black font-bold text-base">{channel.title}</Text>
          <Text className="text-gray-600 mb-3">{total} videos found</Text>

          {(downloading || progress.done > 0) && (
            <View className="mb-3">
              <View className="h-2 bg-gray-300 rounded-full overflow-hidden">
                <View className="h-2 bg-green-500" style={{ width: `${percent}%` }} />
              </View>
              <Text className="text-gray-700 text-xs mt-1">
                {progress.done}/{total} · saved {progress.saved} · skipped {progress.skipped} · failed{' '}
                {progress.failed}
              </Text>
            </View>
          )}

          {downloading ? (
            <TouchableOpacity
              onPress={() => { cancelled.current = true; }}
              className="bg-red-500 p-3 rounded-md items-center flex-row justify-center gap-2"
            >
              <Feather name="x-circle" size={20} color="white" />
              <Text className="text-white font-bold">Stop</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleDownloadAll}
              className="bg-green-600 p-3 rounded-md items-center flex-row justify-center gap-2"
            >
              <Feather name="download" size={20} color="white" />
              <Text className="text-white font-bold">
                {finished ? 'Download again' : `Download all ${total}`}
              </Text>
            </TouchableOpacity>
          )}

          {finished && (
            <Text className="text-green-700 text-xs mt-2">
              Saved in Pictures/Thumvo/Youtube/{safeFolderName(channel.title)}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
};

export default ChannelScreen;
