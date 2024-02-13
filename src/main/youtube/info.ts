import { channelId as _channelId } from '@gonetone/get-youtube-id-by-url'
import { config } from 'dotenv'
import { google } from 'googleapis'
import { Client } from 'youtubei'
import type { Video } from '../../preload/dataType'
import { addChannel } from '../store'
import axios from 'axios'

config()

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

const getLiveVideoIds = async (channelId: string) => {
  const channel = await youtubei.getChannel(channelId)
  if (channel === undefined) {
    return []
  }
  const { live } = channel
  let liveVideos = await live.next()
  let videoIds: string[] = []
  while (liveVideos.length > 0) {
    for (const { id } of liveVideos) {
      videoIds = [...videoIds, id]
    }
    liveVideos = await live.next()
  }
  return videoIds
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
        chatCached: true
      }
      liveVideos = [...liveVideos, video]
    }
  }
  return liveVideos
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
