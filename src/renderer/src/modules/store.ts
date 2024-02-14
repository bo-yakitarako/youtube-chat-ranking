import { atom, selector } from 'recoil'
import { DurationMode } from '../../../preload/dataType'
import dayjs, { Dayjs } from 'dayjs'

const darkModeDefault = localStorage.darkMode === 'true'
const durationModeDefault: DurationMode = localStorage.durationMode ?? 'all'
const channelIdDefault = localStorage.channelId ?? null
const startDateDefault = localStorage.startDate ?? null
const endDateDefault = localStorage.endDate ?? null

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
  default: channelIdDefault
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

export const resetChannelDataSelector = selector({
  key: 'resetChannelDataSelector',
  get: () => {},
  set: ({ set }) => {
    set(videosAtom, null)
    set(mainTypeAtom, 'noVideos')
    set(archiveVideoIdAtom, null)
  }
})
