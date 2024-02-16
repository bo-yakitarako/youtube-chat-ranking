import path from 'path'
import fs from 'fs'
import readline from 'readline'
import { exec } from 'child_process'
import { LiveChat } from 'youtube-chat'
import { BrowserWindow } from 'electron'
import { getStream } from 'yt-dm-stream-url'
import { ArchiveChat, ChatCounts, Video } from '../../preload/dataType'
import { getLiveChat, getLiveVideo } from './info'
import { mergeVideo, addChats, updateChatCached } from '../store'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

let pids: number[] = []

const resourcesPath = path.join(path.resolve('.'), 'resources')
const command = (videoId: string) =>
  `${resourcesPath}/yt-dlp.exe https://www.youtube.com/watch?v=${videoId} --skip-download --write-sub -o "${resourcesPath}/out"`
const chatsFilePath = `${resourcesPath}/out.live_chat.json`

let isLive = false
let liveChannelId = ''
let liveVideo: Video | null = null
let liveChat: LiveChat | null = null
let liveChatCounts: ChatCounts = {}
let liveChatIds: string[] = []

export const gatherArchiveChats = (videoId: string) => {
  return new Promise<ChatCounts | null>((resolve) => {
    const cp = exec(command(videoId), (err) => {
      if (err !== null) {
        resolve(null)
        return
      }
      // yt-dlpはアーカイブにチャットが1件もなかったらファイルを出力しない
      if (!fs.existsSync(chatsFilePath)) {
        resolve({})
        return
      }
      try {
        const readStream = fs.createReadStream(chatsFilePath)
        const lineStream = readline.createInterface({ input: readStream })

        const chatCounts: ChatCounts = {}
        lineStream.on('line', (lineString) => {
          const { replayChatItemAction } = JSON.parse(lineString) as ArchiveChat
          const { addChatItemAction } = replayChatItemAction.actions[0]
          if (addChatItemAction === undefined) {
            return
          }
          const { liveChatTextMessageRenderer } = addChatItemAction.item
          if (liveChatTextMessageRenderer === undefined) {
            return
          }
          const { authorName, authorExternalChannelId } = liveChatTextMessageRenderer
          if (!(authorExternalChannelId in chatCounts)) {
            chatCounts[authorExternalChannelId] = { name: authorName.simpleText, count: 1 }
          } else {
            chatCounts[authorExternalChannelId].name = authorName.simpleText
            chatCounts[authorExternalChannelId].count += 1
          }
        })
        lineStream.on('close', () => {
          resolve(chatCounts)
          fs.unlinkSync(`${resourcesPath}/out.live_chat.json`)
        })
      } catch {
        resolve(null)
      }
    })
    if (cp.pid !== undefined) {
      pids = [...pids, cp.pid]
    }
  })
}

let mainWindow: BrowserWindow
export const setLiveChat = (channelId: string | null) => {
  isLive = false
  liveChatCounts = {}
  liveChatIds = []
  if (mainWindow) {
    mainWindow.webContents.send('liveVideo', null)
    mainWindow.webContents.send('liveChatCounts', {})
  }
  liveChat?.stop()
  if (channelId === null) {
    liveChat = null
    liveChannelId = ''
    return
  }
  liveChannelId = channelId
  liveChat = new LiveChat({ channelId })
}

export const observeLive = (window: BrowserWindow) => {
  mainWindow = window
  setInterval(async () => {
    await isLiveFinish().then((isFinish) => {
      if (isLive && isFinish && liveChannelId !== null) {
        if (liveVideo !== null) {
          mergeVideo(liveChannelId, [liveVideo])
          addChats(liveChannelId, liveVideo.id, liveChatCounts)
          updateChatCached(liveChannelId, liveVideo.id)
          liveVideo = null
        }
        setLiveChat(liveChannelId)
        mainWindow.webContents.send('finishLive')
      }
    })
    if (isLive || liveChat === null) {
      return
    }
    try {
      isLive = await liveChat.start()
      if (!isLive) {
        return
      }
      await getLiveVideo(liveChannelId).then(async (live) => {
        if (live !== null) {
          const { video, activeLiveChatId } = live
          liveVideo = video
          window.webContents.send('liveVideo', video)
          const { chatCounts, chatIds } = await getLiveChat(activeLiveChatId, liveChatIds)
          liveChatIds = [...liveChatIds, ...chatIds]
          liveChatCounts = { ...chatCounts }
          window.webContents.send('liveChatCounts', liveChatCounts)
        }
      })
      liveChat.on('chat', ({ id, author }) => {
        // 謎に2回行われることがあるのでID被りは演算しない
        if (liveChatIds.includes(id)) {
          return
        }
        liveChatIds = [...liveChatIds, id]
        if (author.channelId in liveChatCounts) {
          liveChatCounts[author.channelId].count += 1
          liveChatCounts[author.channelId].name = author.name
        } else {
          liveChatCounts[author.channelId] = { name: author.name, count: 1 }
        }
        window.webContents.send('liveChatCounts', liveChatCounts)
      })
    } catch {
      isLive = false
    }
  }, 1000)
}

const isLiveFinish = async () => {
  if (liveChannelId === null) {
    return false
  }
  const url = `https://www.youtube.com/channel/${liveChannelId}`
  try {
    const streamURL = await getStream(url)
    return !streamURL
  } catch {
    return true
  }
}

export const cleanup = () => {
  pids.forEach((pid) => {
    try {
      process.kill(pid)
    } catch {
      // error handling
    }
  })
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGQUIT', cleanup)
process.on('uncaughtException', cleanup)

export const gatherLiveChats = () => {
  // todo
}
