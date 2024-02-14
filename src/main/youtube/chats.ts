import path from 'path'
import fs from 'fs'
import readline from 'readline'
import { exec } from 'child_process'
import { ArchiveChat, ChatCounts } from '../../preload/dataType'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

let pids: number[] = []

const resourcesPath = path.join(__dirname, '../../resources')
const command = (videoId: string) =>
  `${resourcesPath}/yt-dlp.exe https://www.youtube.com/watch?v=${videoId} --skip-download --write-sub -o "${resourcesPath}/out"`
const chatsFilePath = `${resourcesPath}/out.live_chat.json`

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
