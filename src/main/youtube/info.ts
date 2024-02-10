import { channelId as _channelId } from '@gonetone/get-youtube-id-by-url'
import { config } from 'dotenv'
import { google } from 'googleapis'
import { Client } from 'youtubei'
import type { Video } from '../../preload/dataType'
import { addChannel } from '../store'

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
      part: ['id', 'snippet', 'statistics']
    })
    const videoItems = data.items ?? []
    const liveVideosPart = videoItems.map((video) => {
      const { id, snippet, statistics } = video
      const { title, thumbnails, publishedAt, channelId, channelTitle } = snippet!
      const { viewCount, likeCount } = statistics!
      return {
        id: id!,
        title: title!,
        thumbnails: thumbnails!,
        publishedAt: publishedAt!,
        channelId: channelId!,
        channelTitle: channelTitle!,
        viewCount: viewCount!,
        likeCount: likeCount!,
        chatCached: false
      }
    })
    liveVideos = [...liveVideos, ...liveVideosPart]
  }
  return liveVideos
}
