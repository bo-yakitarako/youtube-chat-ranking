import { ElectronAPI } from '@electron-toolkit/preload'
import type { Channel, DurationMode, RankingRow, VideoObject } from './dataType'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      registerChannel: (channelURL: string) => Promise<string | null>
      getChannel: (channelId: string) => Promise<Channel | null>
      getVideos: (channelId: string) => Promise<VideoObject>
      getVideosFromYouTube: (channelId: string) => Promise<VideoObject>
      gatherChats: (channelId: string, videoId: string) => Promise<VideoObject | null>
      fetchRanking: (
        channelId: string,
        durationMode: DurationMode,
        payload?: string | [number, number]
      ) => Promise<RankingRow[]>
    }
  }
}
