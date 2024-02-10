import { useRecoilValue } from 'recoil'
import { chatGatheringVideoIdAtom, videosAtom } from '../../../../modules/store'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const useChatProgress = () => {
  const videoObject = useRecoilValue(videosAtom)
  const chatGatheringVideoId = useRecoilValue(chatGatheringVideoIdAtom)
  const [video, setVideo] = useState({ title: '', date: dayjs() })
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (videoObject === null || chatGatheringVideoId === null) {
      setVideo({ title: '', date: dayjs() })
      setValue(0)
      return
    }
    const { title, publishedAt } = videoObject[chatGatheringVideoId]
    const videoIds = Object.keys(videoObject).reverse()
    const loadingIndex = videoIds.findIndex((videoId) => videoId === chatGatheringVideoId)
    setVideo({ title, date: dayjs(publishedAt) })
    setValue((100 * loadingIndex) / videoIds.length)
  }, [chatGatheringVideoId])
  return { ...video, value }
}
