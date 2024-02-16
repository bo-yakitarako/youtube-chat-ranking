import { useRecoilState, useRecoilValue } from 'recoil'
import { MainType, channelAtom, mainTypeAtom, videosAtom } from './store'
import { useEffect } from 'react'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const useMainType = () => {
  const channel = useRecoilValue(channelAtom)
  const videos = useRecoilValue(videosAtom)
  const [mainType, setMainType] = useRecoilState(mainTypeAtom)

  useEffect(() => {
    let currentType: MainType = 'noChannel'
    const videoRows = Object.values(videos ?? {})
    if (channel !== null) {
      currentType = 'noVideos'
    }
    if (videos !== null || videoRows.length > 0) {
      currentType = 'noChats'
      if (videoRows.every(({ chatCached }) => chatCached)) {
        currentType = 'ranking'
      }
    }
    if (currentType === 'ranking') {
      // to do something
    }
    setMainType(currentType)
  }, [channel, videos])

  return mainType
}
