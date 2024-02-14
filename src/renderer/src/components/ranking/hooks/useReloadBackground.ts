import { useEffect } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
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
  const durationMode = useRecoilValue(durationModeAtom)
  const getPayload = useRankingPayload(durationMode)
  useEffect(() => {
    if (reloadBackgroundFlag && channeiId !== null) {
      window.api.reloadBackground(channeiId).then(() => {
        window.api.getVideos(channeiId).then((videos) => {
          setVideos(videos)
          window.api.fetchRanking(channeiId, durationMode, getPayload()).then((rankingData) => {
            setRankingData(rankingData)
            setReloadBackgroundFlag(false)
          })
        })
      })
    }
  }, [reloadBackgroundFlag])
}