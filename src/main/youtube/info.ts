import { channelId as _channelId } from '@gonetone/get-youtube-id-by-url'
import { config } from 'dotenv'
import { google } from 'googleapis'
import { Client } from 'youtubei'
import { join } from 'path'
import type { ChatCounts, Video } from '../../preload/dataType'
import { addChannel, getChatCounts, getVideos, setChatCounts, setVideos } from '../store'
import axios from 'axios'

const path = join(__dirname, '../../.env')
config({ path })

/* eslint-disable @typescript-eslint/explicit-function-return-type */

const youtubei = new Client()
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY ?? ''
})

export const getChannelID = async (channelURL: string) => {
  try {
    const id = await _channelId(channelURL)
    return id
  } catch {
    return undefined
  }
}

export const registerChannel = async (channelURL: string) => {
  const channelId = await getChannelID(channelURL)
  if (channelId === undefined) {
    return undefined
  }
  const { name } = (await youtubei.getChannel(channelId))!
  addChannel(channelId, name, channelURL)
  return channelId
}

export const deleteNotPublicVideos = async (channelId: string) => {
  const channel = await youtubei.getChannel(channelId)
  if (channel === undefined) {
    return
  }
  const { live } = channel
  let liveVideos = await live.next()
  let publicVideoIds: string[] = []
  while (liveVideos.length > 0) {
    publicVideoIds = [...publicVideoIds, ...liveVideos.map(({ id }) => id)]
    liveVideos = await live.next()
  }
  const existedVideos = getVideos(channelId)
  const existedChatCounts = getChatCounts(channelId)
  for (const existedVideoId in existedVideos) {
    if (!publicVideoIds.includes(existedVideoId)) {
      delete existedVideos[existedVideoId]
      delete existedChatCounts[existedVideoId]
    }
  }
  setVideos(channelId, existedVideos)
  setChatCounts(channelId, existedChatCounts)
}

const getLiveVideoIds = async (channelId: string) => {
  const channel = await youtubei.getChannel(channelId)
  if (channel === undefined) {
    return []
  }
  const { live } = channel
  let liveVideos = await live.next()
  let videoIds: string[] = []
  const existedVideos = getVideos(channelId)
  while (liveVideos.length > 0) {
    for (const { id } of liveVideos) {
      if (id in existedVideos) {
        continue
      }
      videoIds = [...videoIds, id]
    }
    liveVideos = await live.next()
  }
  return videoIds
}

export const getLiveVideo = async (channelId: string) => {
  const channel = await youtubei.getChannel(channelId)
  if (channel === undefined) {
    return null
  }
  const live = await channel.live.next(0)
  if (live.length === 0) {
    return null
  }
  const { id } = live[0]
  const { data } = await youtube.videos.list({
    id: [id],
    part: ['snippet', 'statistics', 'liveStreamingDetails']
  })
  const { snippet, statistics, liveStreamingDetails } = data.items![0]
  if (!liveStreamingDetails?.activeLiveChatId) {
    return null
  }
  const { title, thumbnails, publishedAt, channelTitle } = snippet!
  const { viewCount, likeCount } = statistics!
  const { activeLiveChatId } = liveStreamingDetails
  const hiraganaTitle = await convertToHiragana(title ?? '')
  const video = {
    id: id!,
    title: title!,
    hiraganaTitle,
    thumbnails: thumbnails!,
    publishedAt: publishedAt!,
    channelId: channelId!,
    channelTitle: channelTitle!,
    viewCount: viewCount!,
    likeCount: likeCount!,
    chatCached: false
  }
  return { video, activeLiveChatId }
}

const GOOGLE_API_MAX_COUNT = 50

export const getLiveVideosFromYouTube = async (channelId: string) => {
  const videoIds = await getLiveVideoIds(channelId)
  let liveVideos: Video[] = []
  while (videoIds.length > 0) {
    const ids = videoIds.splice(0, GOOGLE_API_MAX_COUNT) // spliceは元の配列からも削除する
    const { data } = await youtube.videos.list({
      id: ids,
      part: ['id', 'snippet', 'statistics', 'liveStreamingDetails']
    })
    const videoItems = data.items ?? []
    const liveVideosPart = videoItems.filter(
      ({ liveStreamingDetails }) => !liveStreamingDetails?.activeLiveChatId
    )
    for (const { id, snippet, statistics } of liveVideosPart) {
      const { title, thumbnails, publishedAt, channelId, channelTitle } = snippet!
      const { viewCount, likeCount } = statistics!
      const hiraganaTitle = await convertToHiragana(title ?? '')
      const video = {
        id: id!,
        title: title!,
        hiraganaTitle,
        thumbnails: thumbnails!,
        publishedAt: publishedAt!,
        channelId: channelId!,
        channelTitle: channelTitle!,
        viewCount: viewCount!,
        likeCount: likeCount!,
        chatCached: false
      }
      liveVideos = [...liveVideos, video]
    }
  }
  return liveVideos
}

export const getLiveChat = async (liveChatId: string, existedLiveIds: string[]) => {
  try {
    const { data } = await youtube.liveChatMessages.list({
      liveChatId,
      part: ['id', 'snippet', 'authorDetails']
    })
    const existedChatCounts: ChatCounts = {}
    let chatIds: string[] = []
    const liveChats = data.items ?? []
    for (const { id, snippet, authorDetails } of liveChats) {
      const { channelId, displayName } = authorDetails!
      if (!channelId || snippet?.type !== 'textMessageEvent') {
        continue
      }
      if (id) {
        if (existedLiveIds.includes(id)) {
          continue
        }
        chatIds = [...chatIds, id]
      }
      if (channelId in existedChatCounts) {
        existedChatCounts[channelId].count += 1
        if (displayName) {
          existedChatCounts[channelId].name = displayName
        }
      } else {
        existedChatCounts[channelId] = { name: displayName ?? '', count: 1 }
      }
    }
    return { chatCounts: existedChatCounts, chatIds }
  } catch {
    return { chatCounts: {}, chatIds: [] }
  }
}

const HIRAGANA_URL = 'https://labs.goo.ne.jp/api/hiragana'
const GOO_LAB_API_KEY = process.env.GOO_LAB_API_KEY ?? ''
const OUTPUT_TYPE = 'hiragana'

type HiraganaResponse = {
  request_id: string
  output_type: 'hiragana' | 'katakana'
  converted: string
}

export const convertToHiragana = async (japaneseText: string) => {
  const { data } = await axios<HiraganaResponse>({
    method: 'post',
    url: HIRAGANA_URL,
    headers: {
      'Content-Type': `application/json`
    },
    data: {
      app_id: GOO_LAB_API_KEY,
      sentence: japaneseText,
      output_type: OUTPUT_TYPE
    }
  })
  return data.converted.replaceAll(' ', '').replaceAll('　', '')
}
