import path from 'path'
import fs from 'fs'
import readline from 'readline'
import { exec } from 'child_process'
import { ArchiveChat, ChatCounts } from '../../preload/dataType'
import { LiveChat } from 'youtube-chat'
import { BrowserWindow } from 'electron'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

let pids: number[] = []

const resourcesPath = path.join(__dirname, '../../resources')
const command = (videoId: string) =>
  `${resourcesPath}/yt-dlp.exe https://www.youtube.com/watch?v=${videoId} --skip-download --write-sub -o "${resourcesPath}/out"`
const chatsFilePath = `${resourcesPath}/out.live_chat.json`

let isLive = false
let liveChannelId = ''
let liveChat: LiveChat | null = null
let liveChatCounts: ChatCounts = {}

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

export const setLiveChat = (channelId: string | null) => {
  isLive = false
  liveChatCounts = {}
  if (channelId === null) {
    liveChat = null
    liveChannelId = ''
    return
  }
  liveChannelId = channelId
  liveChat = new LiveChat({ channelId })
}

export const observeLive = (window: BrowserWindow) => {
  setInterval(async () => {
    if (isLive || liveChat === null) {
      return
    }
    try {
      isLive = await liveChat.start()
      if (!isLive) {
        return
      }
      console.log('たまや')
      liveChat.on('start', (liveId) => {
        console.log(liveId)
      })
      liveChat.on('chat', ({ id, author, message }) => {
        console.log({ id, author, message })
        if (author.channelId in liveChatCounts) {
          liveChatCounts[author.channelId].count += 1
          liveChatCounts[author.channelId].name = author.name
        } else {
          liveChatCounts[author.channelId] = { name: author.name, count: 1 }
        }
        window.webContents.send('liveChatCounts', liveChatCounts)
      })
      liveChat.on('end', () => {
        isLive = false
        liveChat?.stop()
        console.log('おわりらしい')
      })
    } catch {
      isLive = false
      liveChat.stop()
    }
  }, 1000)
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
