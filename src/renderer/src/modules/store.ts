import { atom, selector } from 'recoil'
import { ChatCounts, DurationMode, RankingRowObject, Video } from '../../../preload/dataType'
import dayjs, { Dayjs } from 'dayjs'

const darkModeDefault = localStorage.darkMode === 'true'
const durationModeDefault: DurationMode = localStorage.durationMode ?? 'all'
const channelIdDefault: string | null = localStorage.channelId ?? null
const startDateDefault = localStorage.startDate ?? null
const endDateDefault = localStorage.endDate ?? null

if (channelIdDefault !== null) {
  window.api.setLiveChannelId(channelIdDefault)
}

export const darkModeAtom = atom({
  key: 'darkModeAtom',
  default: darkModeDefault
})

export const durationModeAtom = atom({
  key: 'durationModeAtom',
  default: durationModeDefault
})

export const channelIdAtom = atom({
  key: 'channelIdAtom',
  default: channelIdDefault as string | null
})

export const channelAtom = atom({
  key: 'channelAtom',
  default: channelIdDefault !== null ? window.api.getChannel(channelIdDefault) : null
})

export type MainType = 'noChannel' | 'noVideos' | 'noChats' | 'ranking' | 'archiveSearch'

export const mainTypeAtom = atom({
  key: 'mainTypeAtom',
  default: 'noChannel' as MainType
})

export const videosAtom = atom({
  key: 'videosAtom',
  default: channelIdDefault !== null ? window.api.getVideos(channelIdDefault) : null
})

export const chatGatheringVideoIdAtom = atom<string | null>({
  key: 'chatGatheringVideoIdAtom',
  default: null
})

const startDefault = startDateDefault ? dayjs(startDateDefault) : dayjs().subtract(1, 'd')
const endDefault = endDateDefault ? dayjs(endDateDefault) : dayjs()
export const customDateAtom = atom({
  key: 'customDateAtom',
  default: [startDefault, endDefault] as [Dayjs, Dayjs]
})

export const archiveVideoIdAtom = atom({
  key: 'archiveVideoIdAdom',
  default: null as string | null
})

export const rankingDataAtom = atom({
  key: 'rankingDataAtom',
  default: {} as RankingRowObject
})

export const reloadBackgroundFlagAtom = atom({
  key: 'reloadBackgroundFlagAtom',
  default: true
})

export const liveChatCountsAtom = atom({
  key: 'liveChatCountsAtom',
  default: {} as ChatCounts
})

export const liveVideoAtom = atom({
  key: 'liveVideoAtom',
  default: null as Video | null
})

export const cachedUsersAtom = atom({
  key: 'cachedUsersAtom',
  default: window.api.getCachedUsers(channelIdDefault ?? '')
})

export const resetChannelDataSelector = selector({
  key: 'resetChannelDataSelector',
  get: () => {},
  set: ({ set }) => {
    set(videosAtom, null)
    set(mainTypeAtom, 'noVideos')
    set(archiveVideoIdAtom, null)
    set(reloadBackgroundFlagAtom, false)
  }
})
