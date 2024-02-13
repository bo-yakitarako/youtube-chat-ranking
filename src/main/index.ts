import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { convertToHiragana, getLiveVideosFromYouTube, registerChannel } from './youtube/info'
import {
  checkCached,
  createRankingData,
  getChannel,
  getVideos,
  mergeVideo,
  setChats,
  updateChatCached
} from './store'
import { cleanup, gatherArchiveChats } from './youtube/chats'
import { DurationMode } from '../preload/dataType'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  checkCached()
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    cleanup()
  }
})

// app.on('quit', cleanup)

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// @ts-ignore 使用しない引数。はっきり言って邪魔。害悪。出ろ
ipcMain.handle('registerChannel', async (e, channelURL: string) => {
  const channelId = await registerChannel(channelURL)
  return channelId ?? null
})

// @ts-ignore わからない。わからないよ先生は。お前が。
ipcMain.handle('getChannel', (e, channelId: string) => {
  const channel = getChannel(channelId)
  return channel ?? null
})

// @ts-ignore PPP50本な。
ipcMain.handle('getVideos', (e, channelId: string) => {
  const videos = getVideos(channelId)
  return videos ?? null
})

// @ts-ignore 今コードええ感じやねん。
ipcMain.handle('getVideosFromYouTube', async (e, channelId: string) => {
  const liveVideos = await getLiveVideosFromYouTube(channelId)
  const videosObject = mergeVideo(channelId, liveVideos)
  return videosObject
})

// @ts-ignore e～～～そこをなっ！しっかりと意識してやっていきましょう。OK？
ipcMain.handle('gatherChats', async (e, channelId: string, videoId: string) => {
  const chats = await gatherArchiveChats(videoId)
  if (chats === null) {
    return null
  }
  setChats(channelId, videoId, chats)
  const cachedVideos = updateChatCached(channelId, videoId)
  return cachedVideos
})

ipcMain.handle(
  'fetchRanking',
  // @ts-ignore おignoreちゃんチロリ
  (e, channelId: string, durationMode: DurationMode, payload?: string) =>
    createRankingData(channelId, durationMode, payload)
)

// @ts-ignore ignoreエクササイズは17回目から効果が出てくる
ipcMain.handle('convertToHiragana', async (e, text: string) => {
  const katakanaText = await convertToHiragana(text)
  return katakanaText
})
