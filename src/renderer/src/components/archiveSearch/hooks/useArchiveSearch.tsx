/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { ChangeEvent, useCallback, useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  archiveSearchResultAtom,
  archiveSearchValueAtom,
  archiveVideoIdAtom,
  channelIdAtom,
  isUserSearchAtom,
  mainTypeAtom,
  videosAtom
} from '../../../modules/store'
import { Video } from '../../../../../preload/dataType'
import dayjs from 'dayjs'

export type SearchResult = {
  id: string
  title: string
  thumbnail: string
  date: string
}

export const useArchiveSearch = () => {
  const videoObject = useRecoilValue(videosAtom) ?? {}
  const setArchiveVideoId = useSetRecoilState(archiveVideoIdAtom)
  const setMainType = useSetRecoilState(mainTypeAtom)
  const [archiveValue, setArchiveValue] = useRecoilState(archiveSearchValueAtom)
  const [savedResult, setSavedResult] = useRecoilState(archiveSearchResultAtom)
  const [isUserSearch, setIsUserSearch] = useRecoilState(isUserSearchAtom)
  const [canClick, setCanClick] = useState(true)
  const [loading, setLoading] = useState(false)
  const rawVideos = Object.values(videoObject)
  const searchVideos = useSearchVideos()

  const [searchResult, setSearchResult] = useState<SearchResult[]>(
    savedResult ?? convertToSearchResult(rawVideos)
  )

  const search = useCallback(
    (word: string, isUserSearch: boolean) => {
      delayProcess(async () => {
        setLoading(true)
        setArchiveValue(word)
        let result: SearchResult[]
        if (word.length === 0) {
          result = convertToSearchResult(rawVideos)
        } else {
          const targetVideos = await searchVideos(rawVideos, word, isUserSearch)
          result = convertToSearchResult(targetVideos)
        }
        setSearchResult(result)
        setSavedResult(result)
        setCanClick(true)
        setLoading(false)
      }, 500)
    },
    [rawVideos]
  )

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (loading) {
        return
      }
      const word = e.target.value
      setCanClick(false)
      search(word, isUserSearch)
    },
    [loading, isUserSearch, search]
  )

  const selectVideo = async (videoId: string) => {
    if (!canClick) {
      return
    }
    setArchiveVideoId(videoId)
    setMainType('ranking')
  }

  const toggleUserSearch = () => {
    setIsUserSearch((value) => {
      search(archiveValue, !value)
      return !value
    })
  }

  return {
    loading,
    archiveValue,
    searchResult,
    onChange,
    selectVideo,
    isUserSearch,
    toggleUserSearch
  }
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

const useSearchVideos = () => {
  const channelId = useRecoilValue(channelIdAtom)

  const searchByNormalWords = async (videos: Video[], words: string[], isUserSearch: boolean) => {
    if (channelId !== null && isUserSearch) {
      const videoIds = await window.api.searchVideoIdsByUser(channelId, words)
      console.log(videoIds)
      return videos.filter(({ id }) => videoIds.includes(id))
    }
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

  return async (videos: Video[], rawWord: string, isUserSearch: boolean) => {
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
    const results = await searchByNormalWords(
      searchByCommand(videos, commandWords),
      normalWords,
      isUserSearch
    )
    return results
  }
}
