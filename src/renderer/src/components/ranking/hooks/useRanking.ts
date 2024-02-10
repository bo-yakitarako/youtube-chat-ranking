import { useCallback, useEffect, useState } from 'react'
import { DurationMode, RankingRow } from '../../../../../preload/dataType'
import { useRecoilValue } from 'recoil'
import { channelIdAtom, customDateAtom, durationModeAtom, videosAtom } from '../../../modules/store'
import { getDurationDates } from '../../../modules/durationUtils'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const useRanking = () => {
  const [loading, setLoading] = useState(true)
  const [rankingData, setRankingData] = useState<RankingRow[]>([])
  const channelId = useRecoilValue(channelIdAtom)
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

const useRankingPayload = (durationMode: DurationMode) => {
  const videos = useRecoilValue(videosAtom)!
  const customDate = useRecoilValue(customDateAtom)
  return useCallback(() => {
    if (durationMode === 'all') {
      return undefined
    }
    if (durationMode === 'currentLive') {
      return Object.keys(videos)[0]
    }
    if (durationMode === 'pastLive') {
      return Object.keys(videos)[0]
    }
    if (durationMode === 'custom') {
      return customDate.map((d) => d.unix()) as [number, number]
    }
    const duration = getDurationDates(durationMode)
    return duration.map((d) => d.unix()) as [number, number]
  }, [durationMode, videos, customDate])
}
