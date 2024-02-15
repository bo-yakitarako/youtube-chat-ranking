import { useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  cachedUsersAtom,
  channelIdAtom,
  chatGatheringVideoIdAtom,
  mainTypeAtom,
  reloadBackgroundFlagAtom,
  videosAtom
} from '../../../../modules/store'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const useNoChats = () => {
  const [gathering, setGathering] = useState(false)
  const setChatGatheringVideoId = useSetRecoilState(chatGatheringVideoIdAtom)
  const channelId = useRecoilValue(channelIdAtom)!
  const [videos, setVideos] = useRecoilState(videosAtom)
  const setMainType = useSetRecoilState(mainTypeAtom)
  const setReloadBackgroundFlag = useSetRecoilState(reloadBackgroundFlagAtom)
  const setCachedUsers = useSetRecoilState(cachedUsersAtom)

  const gatherChats = async () => {
    if (videos === null) {
      return
    }
    setGathering(true)
    const reversedVideos = [...Object.values(videos)].reverse()
    const noChatCachedVideos = reversedVideos.filter(({ chatCached }) => !chatCached)
    for (const { id } of noChatCachedVideos) {
      setChatGatheringVideoId(id)
      const cachedVideos = await window.api.gatherChats(channelId, id)
      if (cachedVideos === null) {
        continue
      }
      setVideos(cachedVideos)
    }
    const cachedUsers = await window.api.getCachedUsers(channelId)
    setCachedUsers(cachedUsers)
    setGathering(false)
    setReloadBackgroundFlag(false)
    setMainType('ranking')
  }

  return { gathering, gatherChats }
}
