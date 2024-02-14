import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { DurationMode } from './dataType'
import { Dayjs } from 'dayjs'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

// Custom APIs for renderer
const api = {
  registerChannel: (channelURL: string) => ipcRenderer.invoke('registerChannel', channelURL),
  getChannel: (channelId: string) => ipcRenderer.invoke('getChannel', channelId),
  getVideos: (channelId: string) => ipcRenderer.invoke('getVideos', channelId),
  getVideosFromYouTube: (channelId: string) =>
    ipcRenderer.invoke('getVideosFromYouTube', channelId),
  gatherChats: (channelId: string, videoId: string) =>
    ipcRenderer.invoke('gatherChats', channelId, videoId),
  fetchRanking: (
    channelId: string,
    durationMode: DurationMode,
    payload?: string | [Dayjs, Dayjs]
  ) => ipcRenderer.invoke('fetchRanking', channelId, durationMode, payload),
  convertToHiragana: (text: string) => ipcRenderer.invoke('convertToHiragana', text),
  reloadBackground: (channelId: string) => ipcRenderer.invoke('reloadBackground', channelId)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
