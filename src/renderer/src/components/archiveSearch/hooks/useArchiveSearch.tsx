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
      delayProcess(async () => {
        const word = e.target.value
        if (word.length === 0) {
          setSearchResult(convertToSearchResult(rawVideos))
          return
        }
        const targetVideos = await searchVideos(rawVideos, word)
        setSearchResult(convertToSearchResult(targetVideos))
      }, 500)
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

let process: number | null = null
// eslint-disable-next-line @typescript-eslint/ban-types
const delayProcess = (callback: Function, delay: number) => {
  if (process !== null) {
    window.clearTimeout(process)
  }
  process = window.setTimeout(callback, delay)
}

const searchVideos = async (videos: Video[], rawWord: string) => {
  let normalWords = [] as string[]
  let commandWords = [] as string[]
  for (const splitByHalfSpace of rawWord.split(' ')) {
    for (const splitByFullSpace of splitByHalfSpace.split('　')) {
      if (splitByFullSpace.startsWith('from:') || splitByFullSpace.startsWith('until:')) {
        commandWords = [...commandWords, splitByFullSpace]
      } else {
        normalWords = [...normalWords, splitByFullSpace]
      }
    }
  }
  const results = await searchByNormalWords(searchByCommand(videos, commandWords), normalWords)
  return results
}

const searchByNormalWords = async (videos: Video[], words: string[]) => {
  let hiraganaWords = [] as string[]
  for (const word of words) {
    if (!word) {
      continue
    }
    const hiraganaWord = await window.api.convertToHiragana(word)
    hiraganaWords = [...hiraganaWords, hiraganaWord]
  }
  return videos.filter(({ hiraganaTitle }) =>
    hiraganaWords.every((word) => hiraganaTitle.includes(word))
  )
}

const searchByCommand = (video: Video[], commands: string[]) => {
  const from = commands.find((command) => command.startsWith('from:'))
  const until = commands.find((command) => command.startsWith('until:'))
  let resultVideos = [...video]
  if (from !== undefined) {
    const time = from.split(':')[1]
    const targetDayjs = dayjs(time)
    if (targetDayjs.isValid()) {
      resultVideos = resultVideos.filter(({ publishedAt }) =>
        dayjs(publishedAt).isAfter(targetDayjs)
      )
    }
  }
  if (until !== undefined) {
    const time = until.split(':')[1]
    const targetDayjs = dayjs(time)
    if (targetDayjs.isValid()) {
      resultVideos = resultVideos.filter(({ publishedAt }) =>
        dayjs(publishedAt).isBefore(targetDayjs)
      )
    }
  }
  return resultVideos
}
