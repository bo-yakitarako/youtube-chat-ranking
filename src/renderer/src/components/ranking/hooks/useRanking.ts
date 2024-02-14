import { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import {
  channelIdAtom,
  customDateAtom,
  durationModeAtom,
  rankingDataAtom
} from '../../../modules/store'
import { useRankingPayload } from './useRankingPayload'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const useRanking = () => {
  const [loading, setLoading] = useState(true)
  const [rankingData, setRankingData] = useRecoilState(rankingDataAtom)
  const channelId = useRecoilValue(channelIdAtom)!
  const durationMode = useRecoilValue(durationModeAtom)
  const customDate = useRecoilValue(customDateAtom)
  const getPayload = useRankingPayload(durationMode)

  useEffect(() => {
    setLoading(true)
    window.api.fetchRanking(channelId, durationMode, getPayload()).then((data) => {
      setRankingData(data)
      setLoading(false)
    })
  }, [durationMode, customDate])

  return { loading, rankingData }
}
