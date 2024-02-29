import { channelId as _channelId } from '@gonetone/get-youtube-id-by-url'
import { config } from 'dotenv'
import { google } from 'googleapis'
import { Client } from 'youtubei'
import { join } from 'path'
import type { Video } from '../../preload/dataType'
import { addChannel, getChatCounts, getVideos, setChatCounts, setVideos } from '../store'
import axios from 'axios'

const path = join(__dirname, '../../.env')
config({ path })

/* eslint-disable @typescript-eslint/explicit-function-return-type */

const youtubei = new Client()
const youtube = google.youtube({
  version: 'v3',
  auth: import.meta.env.MAIN_VITE_YOUTUBE_API_KEY
})

export const getChannelID = async (channelURL: string) => {
  try {
    const id = await _channelId(channelURL)
    return id
  } catch (e) {
    console.error(e)
    return undefined
  }
}

export const registerChannel = async (channelURL: string) => {
  try {
    const channelId = await getChannelID(channelURL)
    if (channelId === undefined) {
      return undefined
    }
    const channel = await youtubei.getChannel(channelId)
    if (channel === undefined) {
      return undefined
    }
    addChannel(channelId, channel.name, channelURL)
    return channelId
  } catch (e) {
    console.error(e)
    return undefined
  }
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
  console.log(`既存アーカイブ数: ${Object.keys(existedVideos).length}`)
  console.log(`取得アーカイブ数: ${videoIds.length}`)
  return videoIds
}

const GOOGLE_API_MAX_COUNT = 50

export const getLiveVideosFromYouTube = async (channelId: string) => {
  try {
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
  } catch (e) {
    console.error(e)
    return []
  }
}

const HIRAGANA_URL = 'https://labs.goo.ne.jp/api/hiragana'
const GOO_LAB_API_KEY = import.meta.env.MAIN_VITE_GOO_LAB_API_KEY
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
