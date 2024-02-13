import { useRecoilValue } from 'recoil'
import { archiveVideoIdAtom, durationModeAtom, videosAtom } from '../../../modules/store'
import { useMemo } from 'react'
import { durationTitleDict } from '../../../modules/durationUtils'

export const useRankingHeaderTitle = (): string => {
  const durationMode = useRecoilValue(durationModeAtom)
  const videos = useRecoilValue(videosAtom)
  const archiveVideoId = useRecoilValue(archiveVideoIdAtom)

  const title = useMemo(() => {
    if (durationMode !== 'archive' || videos === null || archiveVideoId === null) {
      return `ランキング: ${durationTitleDict[durationMode]}`
    }
    return videos[archiveVideoId].title
  }, [durationMode, videos, archiveVideoId])

  return title
}
