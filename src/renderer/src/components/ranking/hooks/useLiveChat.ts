import { useRecoilValue, useSetRecoilState } from 'recoil'
import {
  cachedUsersAtom,
  channelIdAtom,
  durationModeAtom,
  liveChatCountsAtom,
  liveVideoAtom,
  rankingDataAtom
} from '../../../modules/store'
import { useEffect } from 'react'
import { ChatCounts, RankingUserObject, Video } from '../../../../../preload/dataType'
import { useRankingPayload } from './useRankingPayload'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const useLiveChat = () => {
  const channelId = useRecoilValue(channelIdAtom)
  const durationMode = useRecoilValue(durationModeAtom)
  const setLiveChatCounts = useSetRecoilState(liveChatCountsAtom)
  const setLiveVideo = useSetRecoilState(liveVideoAtom)
  const getPayload = useRankingPayload(durationMode)
  const setRankingRowObject = useSetRecoilState(rankingDataAtom)
  const setCachedUsers = useSetRecoilState(cachedUsersAtom)

  useEffect(() => {
    // @ts-ignore なんなんマジで
    window.ipcRenderer.on('liveChatCounts', (e, chatCounts: ChatCounts) => {
      setLiveChatCounts(chatCounts)
    })
    // @ts-ignore まじきっしょいわアイツ
    window.ipcRenderer.on('liveVideo', (e, video: Video) => {
      setLiveVideo(video)
    })
    // @ts-ignore それはないっしょ
    window.ipcRenderer.on('cachedusers', (e, cachedusers: RankingUserObject) => {
      setCachedUsers(cachedusers)
    })
  }, [])

  useEffect(() => {
    const eventListner = window.ipcRenderer.on('finishLive', () => {
      window.api.fetchRanking(channelId!, durationMode, getPayload()).then((data) => {
        setRankingRowObject(data)
      })
    })
    return () => {
      eventListner.removeAllListeners('finishLive')
    }
  }, [channelId, durationMode])
}
