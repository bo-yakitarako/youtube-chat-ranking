/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { ChangeEvent, useCallback, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { videosAtom } from '../../../modules/store'
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

  return { searchResult, onChange }
}

const convertToSearchResult = (videos: Video[]) =>
  videos.map(({ id, title, thumbnails, publishedAt }) => ({
    id,
    title,
    thumbnail: thumbnails.medium?.url ?? '',
    date: dayjs(publishedAt).format('YYYY/MM/DD')
  }))
