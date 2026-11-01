import Config from 'react-native-config';

const API = 'https://www.googleapis.com/youtube/v3';

export type ChannelInfo = {
  id: string;
  title: string;
};

export type ChannelVideo = {
  id: string;
  title: string;
  publishedAt: string;
};

export type FetchOptions = {
  sinceDate?: Date;
  maxVideos?: number;
  onProgress?: (found: number) => void;
  isCancelled?: () => boolean;
};

const callApi = async (path: string, params: Record<string, string>) => {
  const apiKey = Config.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY missing in .env file');
  }
  const query = new URLSearchParams({ ...params, key: apiKey }).toString();
  const response = await fetch(`${API}/${path}?${query}`);
  const json = await response.json();
  if (!response.ok) {
    const reason = json?.error?.errors?.[0]?.reason;
    const err: any = new Error(json?.error?.message || 'YouTube API error');
    err.reason = reason;
    err.status = response.status;
    throw err;
  }
  return json;
};

const channelFromList = (json: any): ChannelInfo | null => {
  const item = json?.items?.[0];
  return item ? { id: item.id, title: item.snippet.title } : null;
};

export const resolveChannel = async (input: string): Promise<ChannelInfo> => {
  const text = input.trim();

  const idMatch = text.match(/youtube\.com\/channel\/(UC[\w-]{22})/) || text.match(/^(UC[\w-]{22})$/);
  if (idMatch) {
    const found = channelFromList(await callApi('channels', { part: 'snippet', id: idMatch[1] }));
    if (found) return found;
  }

  const handleMatch = text.match(/youtube\.com\/(@[\w.\-%]+)/) || text.match(/^(@[\w.\-%]+)$/);
  if (handleMatch) {
    const found = channelFromList(
      await callApi('channels', { part: 'snippet', forHandle: handleMatch[1] }),
    );
    if (found) return found;
  }

  const userMatch = text.match(/youtube\.com\/user\/([\w.\-%]+)/);
  if (userMatch) {
    const found = channelFromList(
      await callApi('channels', { part: 'snippet', forUsername: userMatch[1] }),
    );
    if (found) return found;
  }

  // Legacy /c/<name> links have no direct lookup, so search once (costs 100 quota units)
  const customMatch = text.match(/youtube\.com\/c\/([\w.\-%]+)/);
  if (customMatch) {
    const json = await callApi('search', {
      part: 'snippet',
      type: 'channel',
      maxResults: '1',
      q: customMatch[1],
    });
    const item = json?.items?.[0];
    if (item) return { id: item.snippet.channelId, title: item.snippet.channelTitle };
  }

  throw new Error('Channel not found. Paste a channel link like youtube.com/@name');
};

// Shorts are vertical; oEmbed reports the player size, so height > width means Short.
const isVertical = async (videoId: string): Promise<boolean> => {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(url);
    if (!response.ok) return false;
    const { width, height } = await response.json();
    return height > width;
  } catch (_) {
    return false;
  }
};

/**
 * Walks a channel's uploads newest-first and stops once the date/count limit is hit.
 * Uses the UULF playlist (long-form only, no Shorts). If YouTube ever stops serving it,
 * falls back to the full uploads playlist and drops vertical videos via oEmbed.
 */
export const fetchChannelLongVideos = async (
  channelId: string,
  { sinceDate, maxVideos, onProgress, isCancelled }: FetchOptions = {},
): Promise<ChannelVideo[]> => {
  const walk = async (playlistId: string, dropShorts: boolean) => {
    const videos: ChannelVideo[] = [];
    let pageToken = '';

    while (true) {
      if (isCancelled?.()) return videos;

      const params: Record<string, string> = {
        part: 'snippet,contentDetails',
        playlistId,
        maxResults: '50',
      };
      if (pageToken) params.pageToken = pageToken;
      const json = await callApi('playlistItems', params);

      for (const item of json.items ?? []) {
        const publishedAt = item.contentDetails?.videoPublishedAt;
        if (!publishedAt) continue; // private or deleted video
        if (sinceDate && new Date(publishedAt) < sinceDate) return videos;

        const id = item.contentDetails.videoId;
        if (dropShorts && (await isVertical(id))) continue;

        videos.push({ id, title: item.snippet.title, publishedAt });
        onProgress?.(videos.length);
        if (maxVideos && videos.length >= maxVideos) return videos;
      }

      pageToken = json.nextPageToken;
      if (!pageToken) return videos;
    }
  };

  const suffix = channelId.slice(2);
  try {
    return await walk(`UULF${suffix}`, false);
  } catch (err: any) {
    if (err.reason !== 'playlistNotFound') throw err;
    return walk(`UU${suffix}`, true);
  }
};
