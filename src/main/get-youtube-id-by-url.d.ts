declare module '@gonetone/get-youtube-id-by-url' {
  export function channelId(channelURL: string): Promise<string>
  export function videoId(videoURL: string): Promise<string>
}

declare module 'yt-dm-stream-url' {
  export function getStream(streamURL: string): Promise<string>
}
