export const extractVideoId = (url: string): string | null => {
  const regex = /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/watch\?v=|\/v\/|\/shorts\/))([^\s&?/]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
