import path from 'path'
import fs from 'fs'
import readline from 'readline'
import { exec } from 'child_process'
import { LiveChat } from 'youtube-chat'
import { BrowserWindow } from 'electron'
import { getStream } from 'yt-dm-stream-url'
import { ArchiveChat, ChatCounts, LiveStore } from '../../preload/dataType'
import { getLiveStore, deleteLiveStore, setLiveStore, getCachedUsers } from '../store'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

let pids: number[] = []

const resourcesPath = path.join(path.resolve('.'), 'resources')
const command = (videoId: string) =>
  `${resourcesPath}/yt-dlp.exe https://www.youtube.com/watch?v=${videoId} --skip-download --write-sub -o "${resourcesPath}/out"`
const chatsFilePath = `${resourcesPath}/out.live_chat.json`

let isLive = false
let liveChannelId = ''
let liveChat: LiveChat | null = null
let liveStore: LiveStore | null = null

export const gatherArchiveChats = (videoId: string) => {
  return new Promise<ChatCounts | null>((resolve) => {
    const cp = exec(command(videoId), (err, stdout, stderr) => {
      if (err !== null) {
        console.error(stderr)
        resolve(null)
        return
      }
      // yt-dlpはアーカイブにチャットが1件もなかったらファイルを出力しない
      if (!fs.existsSync(chatsFilePath) || stdout.includes('There are no subtitles')) {
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
      } catch (e) {
        console.error(e)
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
  let isLiveStarted: boolean | null = null
  setInterval(async () => {
    await isLiveFinish().then((isFinish) => {
      if (isLiveStarted === null) {
        isLiveStarted = !isFinish
      }
      if (isLive && isFinish && liveChannelId) {
        liveStore = null
        deleteLiveStore(liveChannelId)
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
      liveStore = getLiveStore(liveChannelId ?? '')
      if (liveStore === null) {
        liveStore = {
          liveChatCounts: {},
          liveChatIds: []
        }
      }
      window.webContents.send('liveChatCounts', liveStore.liveChatCounts)
      liveChat.on('chat', ({ id, author }) => {
        if (liveStore === null) {
          return
        }
        // 謎に2回行われることがあるのでID被りは演算しない
        if (liveStore.liveChatIds.includes(id)) {
          return
        }
        liveStore.liveChatIds = [...liveStore.liveChatIds, id]
        if (author.channelId in liveStore.liveChatCounts) {
          liveStore.liveChatCounts[author.channelId].count += 1
          liveStore.liveChatCounts[author.channelId].name = author.name
        } else {
          liveStore.liveChatCounts[author.channelId] = { name: author.name, count: 1 }
        }
        if (liveChannelId) {
          const cachedUsers = getCachedUsers(liveChannelId)
          window.webContents.send('cachedusers', cachedUsers)
          setLiveStore(liveChannelId, liveStore)
        }
        window.webContents.send('liveChatCounts', liveStore.liveChatCounts)
      })
    } catch {
      isLive = false
    }
  }, 1000)
}

const isLiveFinish = async () => {
  if (liveChannelId === null) {
    return true
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
