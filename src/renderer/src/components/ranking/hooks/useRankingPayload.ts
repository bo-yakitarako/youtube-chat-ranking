import { useRecoilValue } from 'recoil'
import { DurationMode } from '../../../../../preload/dataType'
import { archiveVideoIdAtom, customDateAtom, videosAtom } from '../../../modules/store'
import { useCallback } from 'react'
import { getDurationDates } from '../../../modules/durationUtils'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const useRankingPayload = (durationMode: DurationMode) => {
  const videos = useRecoilValue(videosAtom) ?? {}
  const customDate = useRecoilValue(customDateAtom)
  const archiveVideoId = useRecoilValue(archiveVideoIdAtom)
  return useCallback(() => {
    if (durationMode === 'all') {
      return undefined
    }
    if (durationMode === 'live') {
      return Object.keys(videos)[0]
    }
    if (durationMode === 'archive') {
      return archiveVideoId ?? Object.keys(videos)[0]
    }
    if (durationMode === 'custom') {
      return customDate.map((d) => d.unix()) as [number, number]
    }
    const duration = getDurationDates(durationMode)
    return duration.map((d) => d.unix()) as [number, number]
  }, [durationMode, videos, customDate, archiveVideoId])
}
