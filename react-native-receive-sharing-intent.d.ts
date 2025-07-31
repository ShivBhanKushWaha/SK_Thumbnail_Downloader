declare module 'react-native-receive-sharing-intent' {
  interface FileData {
    weblink: string;
    filePath: string;
    fileName: string;
    extension: string;
    mimeType: string;
    text: string;
  }

  const ReceiveSharingIntent: {
    getReceivedFiles: (
      handler: (files: FileData[]) => void,
      errorHandler: (error: any) => void,
      protocol: string
    ) => void;

    clearReceivedFiles: () => void;

    getReceivedText: (
      handler: (text: string) => void,
      errorHandler: (error: any) => void,
      protocol: string
    ) => void;

    clearReceivedText: () => void;
  };

  export default ReceiveSharingIntent;

  export function getReceivedText(arg0: (text: string) => void, arg1: (error: any) => void, arg2: string) {
    throw new Error('Function not implemented.');
  }

  export function clearReceivedText(): void | { [UNDEFINED_VOID_ONLY]: never; } {
    throw new Error('Function not implemented.');
  }
}
