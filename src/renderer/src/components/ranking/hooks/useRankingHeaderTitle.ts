import { useRecoilValue } from 'recoil'
import { archiveVideoIdAtom, durationModeAtom, videosAtom } from '../../../modules/store'
import { useMemo } from 'react'

export const useRankingHeaderTitle = (): string => {
  const durationMode = useRecoilValue(durationModeAtom)
  const videos = useRecoilValue(videosAtom)
  const archiveVideoId = useRecoilValue(archiveVideoIdAtom)

  const title = useMemo(() => {
    if (durationMode !== 'pastLive' || videos === null || archiveVideoId === null) {
      return 'ランキング'
    }
    return videos[archiveVideoId].title
  }, [durationMode, videos, archiveVideoId])

  return title
}
