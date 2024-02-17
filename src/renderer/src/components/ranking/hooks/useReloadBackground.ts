import { useEffect } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  cachedUsersAtom,
  channelIdAtom,
  durationModeAtom,
  rankingDataAtom,
  reloadBackgroundFlagAtom,
  videosAtom
} from '../../../modules/store'
import { useRankingPayload } from './useRankingPayload'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const useReloadBackground = () => {
  const channeiId = useRecoilValue(channelIdAtom)
  const [reloadBackgroundFlag, setReloadBackgroundFlag] = useRecoilState(reloadBackgroundFlagAtom)
  const setVideos = useSetRecoilState(videosAtom)
  const setRankingData = useSetRecoilState(rankingDataAtom)
  const setCachedUsers = useSetRecoilState(cachedUsersAtom)
  const durationMode = useRecoilValue(durationModeAtom)
  const getPayload = useRankingPayload(durationMode)
  useEffect(() => {
    if (reloadBackgroundFlag && channeiId) {
      window.api.reloadBackground(channeiId).then(() => {
        window.api.getVideos(channeiId).then((videos) => {
          setVideos(videos)
          window.api.fetchRanking(channeiId, durationMode, getPayload()).then((rankingData) => {
            setRankingData(rankingData)
            setReloadBackgroundFlag(false)
          })
          window.api.getCachedUsers(channeiId).then((users) => {
            setCachedUsers(users)
          })
        })
      })
    }
  }, [reloadBackgroundFlag])
}
