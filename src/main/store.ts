import Store from 'electron-store'
import type {
  ChannelObject,
  Chat,
  ChatObject,
  DurationMode,
  RankingRow,
  RankingUser,
  RankingUserObject,
  Video,
  VideoObject
} from '../preload/dataType'
import dayjs from 'dayjs'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

const channelStore = new Store<Record<'channels', ChannelObject>>({ name: 'channel' })
const videoStore = new Store<Record<string, VideoObject>>({ name: 'videos' })
const chatStore = new Store<Record<string, ChatObject>>({ name: 'chats' })
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

export const setChats = (channelId: string, videoId: string, chats: Chat[]) => {
  const oldChatsData = chatStore.get(channelId) ?? {}
  const newChatsData = { ...oldChatsData, [videoId]: chats }
  chatStore.set(channelId, newChatsData)
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
  const chats = chatStore.store ?? {}
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
      return createRankingDataByVideoIds(channelId, videos, Object.keys(videos), true)
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
  videoIds: string[],
  isLive = false
) => {
  const chats = chatStore.get(channelId) ?? {}
  const countData = fetchCountData(chats, videoIds)
  const rankingDataRaw = assignUserInfoForRanking(channelId, chats, videos, countData, isLive)
  const rankingDataSorted = rankingDataRaw.sort((a, b) => b.chatCount - a.chatCount)
  let rank = 1
  return rankingDataSorted.map((data, index, datas) => {
    if (index > 0 && data.chatCount !== datas[index - 1].chatCount) {
      rank = index + 1
    }
    data.rank = rank
    return data
  })
}

const fetchCountData = (chats: ChatObject, videoIds: string[]) => {
  const userCountDict = {} as { [id in string]: number }
  videoIds.forEach((videoId) => {
    const videoChats = chats[videoId] ?? []
    videoChats.forEach(({ author: { id } }) => {
      if (!(id in userCountDict)) {
        userCountDict[id] = 0
      }
      userCountDict[id] += 1
    })
  })
  return userCountDict
}

const assignUserInfoForRanking = (
  channelId: string,
  chats: ChatObject,
  videos: VideoObject,
  countData: { [id in string]: number },
  isLive = false
) => {
  const todayTime = dayjs().unix()
  const users = userStore.get(channelId) ?? {}
  if (isLive && Object.keys(chats).length > 0) {
    delete chats[Object.keys(chats)[0]]
  }
  let infoAddedUsers = [] as RankingRow[]
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
      rank: 0,
      name: cachedUser.name,
      chatCount: countData[userId],
      firstChatDate: dayjsFirstChat.format('YYYY/MM/DD'),
      lastChatDate: dayjsLastChat.format('YYYY/MM/DD')
    }
    const targetVidesoIdsOnLastDate = Object.keys(videos).filter((videoId) =>
      dayjs(videos[videoId].publishedAt).isAfter(dayjsLastChat)
    )
    for (const videoId of targetVidesoIdsOnLastDate) {
      if (!chats[videoId]) {
        continue
      }
      for (const { author } of chats[videoId]) {
        if (author.id === userId) {
          cachedUser.name = author.name
          infoUser.name = author.name
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
      for (const videoId in chats) {
        if (!chats[videoId]) {
          continue
        }
        for (const { author } of chats[videoId]) {
          if (author.id === userId) {
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
    infoAddedUsers = [...infoAddedUsers, infoUser]
    users[userId] = cachedUser
  }
  userStore.set(channelId, users)
  // 謎の書き込み日付のない透明人間がいたので省いておく
  return infoAddedUsers.filter(({ lastChatDate }) => lastChatDate)
}
