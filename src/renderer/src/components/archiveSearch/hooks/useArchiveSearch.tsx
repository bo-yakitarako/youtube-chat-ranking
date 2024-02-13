/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { ChangeEvent, useCallback, useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { archiveVideoIdAtom, mainTypeAtom, videosAtom } from '../../../modules/store'
import { Video } from '../../../../../preload/dataType'
import dayjs from 'dayjs'

type SearchResult = {
  id: string
  title: string
  thumbnail: string
  date: string
}

export const useArchiveSearch = () => {
  const videoObject = useRecoilValue(videosAtom) ?? {}
  const setArchiveVideoId = useSetRecoilState(archiveVideoIdAtom)
  const setMainType = useSetRecoilState(mainTypeAtom)
  const rawVideos = Object.values(videoObject)

  const [searchResult, setSearchResult] = useState<SearchResult[]>(convertToSearchResult(rawVideos))

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const word = e.target.value
      if (word.length === 0) {
        setSearchResult(convertToSearchResult(rawVideos))
        return
      }
      const targetVideos = rawVideos.filter(({ title }) => title.includes(word))
      setSearchResult(convertToSearchResult(targetVideos))
    },
    [rawVideos]
  )

  const selectVideo = (videoId: string) => {
    setArchiveVideoId(videoId)
    setMainType('ranking')
  }

  return { searchResult, onChange, selectVideo }
}

const convertToSearchResult = (videos: Video[]) =>
  [...videos]
    .sort((a, b) => (dayjs(a.publishedAt).isBefore(b.publishedAt) ? 1 : -1))
    .map(({ id, title, thumbnails, publishedAt }) => ({
      id,
      title,
      thumbnail: thumbnails.medium?.url ?? '',
      date: dayjs(publishedAt).format('YYYY/MM/DD')
    }))
