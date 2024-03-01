import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  Channel,
  DurationMode,
  RankingRowObject,
  RankingUserObject,
  VideoObject
} from './dataType'
import { IpcRenderer } from 'electron'

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
      ) => Promise<RankingRowObject>
      convertToHiragana: (text: string) => Promise<string>
      reloadBackground: (channelId: string) => Promise<void>
      setLiveChannelId: (channelId: string) => Promise<void>
      getCachedUsers: (channelId: string) => Promise<RankingUserObject>
      searchVideoIdsByUser: (channelId: string, words: string[]) => Promise<string[]>
    }
    ipcRenderer: IpcRenderer
  }
}
