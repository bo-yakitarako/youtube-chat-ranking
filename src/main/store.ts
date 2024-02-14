import Store from 'electron-store'
import type {
  ChannelObject,
  ChatCounts,
  ChatCountsObject,
  DurationMode,
  RankingRowObject,
  RankingUser,
  RankingUserObject,
  Video,
  VideoObject
} from '../preload/dataType'
import dayjs from 'dayjs'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

const channelStore = new Store<Record<'channels', ChannelObject>>({ name: 'channel' })
const videoStore = new Store<Record<string, VideoObject>>({ name: 'videos' })
const chaCountsStore = new Store<Record<string, ChatCountsObject>>({ name: 'chats' })
const userStore = new Store<Record<string, RankingUserObject>>({ name: 'users' })

const CHANNEL_DB = 'channels'

export const addChannel = (id: string, channelTitle: string, channelURL: string) => {
  const oldChannelData = channelStore.get(CHANNEL_DB) ?? {}
  const newChannelData = { ...oldChannelData, [id]: { id, channelTitle, channelURL } }
  channelStore.set(CHANNEL_DB, newChannelData)
}

export const getChannel = (channelId: string) => {
  const channelData = channelStore.get(CHANNEL_DB)
  return channelData[channelId]
}

export const mergeVideo = (channelId: string, videos: Video[]) => {
  const oldVideoData = videoStore.get(channelId) ?? {}
  const oldVideoIds = Object.keys(oldVideoData)
  const addingVideos = videos.filter(({ id }) => !oldVideoIds.includes(id))
  const newVideos = [...Object.values(oldVideoData), ...addingVideos]
  const sortedVideos = videoSort(newVideos)
  const newVideoData = sortedVideos.reduce(
    (pre, cur) => ({
      ...pre,
      [cur.id]: cur
    }),
    {} as VideoObject
  )
  videoStore.set(channelId, newVideoData)
  return newVideoData
}

const videoSort = (videos: Video[]) => {
  return [...videos].sort((a, b) => {
    return dayjs(a.publishedAt).isBefore(dayjs(b.publishedAt)) ? 1 : -1
  })
}

export const getVideos = (channelId: string) => {
  return videoStore.get(channelId)
}

export const setChats = (channelId: string, videoId: string, chatCounts: ChatCounts) => {
  const oldChatsData = chaCountsStore.get(channelId) ?? {}
  const newChatsData = { ...oldChatsData, [videoId]: chatCounts }
  chaCountsStore.set(channelId, newChatsData)
}

export const updateChatCached = (channelId: string, videoId: string) => {
  const videos = videoStore.get(channelId)
  if (videos[videoId] === undefined) {
    return null
  }
  videos[videoId].chatCached = true
  videoStore.set(channelId, videos)
  return videos
}

export const checkCached = () => {
  const channels = channelStore.get(CHANNEL_DB) ?? {}
  const videos = videoStore.store ?? {}
  const chats = chaCountsStore.store ?? {}
  for (const channelId of Object.keys(channels)) {
    if (!(channelId in videos)) {
      continue
    }
    const channelVideos = videos[channelId]
    const channelChats = chats[channelId] ?? {}
    const cachedVideoIds = Object.keys(channelChats)
    for (const videoId of Object.keys(channelVideos)) {
      if (!cachedVideoIds.includes(videoId)) {
        channelVideos[videoId].chatCached = false
      }
    }
    videoStore.set(channelId, channelVideos)
  }
}

export function createRankingData(
  channelId: string,
  durationMode: DurationMode,
  payload?: string | [number, number]
) {
  const videos = videoStore.get(channelId) ?? {}
  switch (durationMode) {
    case 'all':
      return createRankingDataByVideoIds(channelId, videos, Object.keys(videos))
    case 'live':
      return {}
    case 'archive':
      return createRankingDataByVideoIds(channelId, videos, [payload as string])
    default:
      return createRankingDataByDuration(channelId, videos, payload as [number, number])
  }
}

const createRankingDataByDuration = (
  channelId: string,
  videos: VideoObject,
  duration: [number, number]
) => {
  const start = dayjs.unix(duration[0])
  const end = dayjs.unix(duration[1])
  const videoIds = Object.values(videos)
    .filter(({ publishedAt }) => {
      const target = dayjs(publishedAt)
      return target.isAfter(start) && target.isBefore(end)
    })
    .map(({ id }) => id)
  return createRankingDataByVideoIds(channelId, videos, videoIds)
}

const createRankingDataByVideoIds = (
  channelId: string,
  videos: VideoObject,
  videoIds: string[]
) => {
  const chatCounts = chaCountsStore.get(channelId) ?? {}
  const countData = fetchCountData(chatCounts, videoIds)
  return assignUserInfoForRanking(channelId, chatCounts, videos, countData)
}

const fetchCountData = (chatCounts: ChatCountsObject, videoIds: string[]) => {
  const resultChatCounts = {} as ChatCounts
  videoIds.forEach((videoId) => {
    const videoChatCounts = chatCounts[videoId] ?? {}
    for (const channelId in videoChatCounts) {
      if (!(channelId in resultChatCounts)) {
        resultChatCounts[channelId] = videoChatCounts[channelId]
        continue
      }
      resultChatCounts[channelId].count += videoChatCounts[channelId].count
      resultChatCounts[channelId].name = videoChatCounts[channelId].name
    }
  })
  return resultChatCounts
}

const assignUserInfoForRanking = (
  channelId: string,
  chatCounts: ChatCountsObject,
  videos: VideoObject,
  countData: ChatCounts
) => {
  const todayTime = dayjs().unix()
  const users = userStore.get(channelId) ?? {}
  const infoAddedUsers = {} as RankingRowObject
  for (const userId in countData) {
    let breakFlag = false
    const cachedUser: RankingUser = {
      id: userId,
      name: users[userId]?.name ?? '',
      firstChatTime: users[userId]?.firstChatTime ?? todayTime,
      lastChatTime: users[userId]?.lastChatTime ?? 0
    }
    const dayjsFirstChat = dayjs.unix(cachedUser.firstChatTime)
    const dayjsLastChat = dayjs.unix(cachedUser.lastChatTime)
    const infoUser = {
      authorChannelId: userId,
      name: countData[userId].name,
      chatCount: countData[userId].count,
      firstChatDate: dayjsFirstChat.format('YYYY/MM/DD'),
      lastChatDate: dayjsLastChat.format('YYYY/MM/DD')
    }
    const targetVidesoIdsOnLastDate = Object.keys(videos).filter((videoId) =>
      dayjs(videos[videoId].publishedAt).isAfter(dayjsLastChat)
    )
    for (const videoId of targetVidesoIdsOnLastDate) {
      if (!chatCounts[videoId]) {
        continue
      }
      const videoChatCounts = chatCounts[videoId]
      for (const chatUserId in chatCounts[videoId]) {
        if (chatUserId === userId) {
          cachedUser.name = infoUser.name = videoChatCounts[chatUserId].name
          breakFlag = true
          break
        }
      }
      if (breakFlag) {
        const d = dayjs(videos[videoId].publishedAt)
        infoUser.lastChatDate = d.format('YYYY/MM/DD')
        cachedUser.lastChatTime = d.unix()
        break
      }
    }
    if (cachedUser.firstChatTime === todayTime) {
      breakFlag = false
      for (const videoId in chatCounts) {
        if (!chatCounts[videoId]) {
          continue
        }
        for (const chatUserId in chatCounts[videoId]) {
          if (chatUserId === userId) {
            breakFlag = true
            break
          }
        }
        if (breakFlag) {
          const d = dayjs(videos[videoId].publishedAt)
          infoUser.firstChatDate = d.format('YYYY/MM/DD')
          cachedUser.firstChatTime = d.unix()
          break
        }
      }
    }
    // 謎の書き込み日付のない透明人間がいたので省いておく
    if (infoUser.lastChatDate) {
      infoAddedUsers[userId] = infoUser
    }
    users[userId] = cachedUser
  }
  userStore.set(channelId, users)
  return infoAddedUsers
}
