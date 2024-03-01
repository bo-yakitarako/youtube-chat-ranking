import { useEffect, useMemo, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import {
  cachedUsersAtom,
  channelIdAtom,
  customDateAtom,
  durationModeAtom,
  liveChatCountsAtom,
  rankingDataAtom
} from '../../../modules/store'
import { useRankingPayload } from './useRankingPayload'
import { RankingRowObject } from '../../../../../preload/dataType'
import dayjs from 'dayjs'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const useRanking = () => {
  const [loading, setLoading] = useState(true)
  const [rankingRowObject, setRankingRowObject] = useRecoilState(rankingDataAtom)
  const channelId = useRecoilValue(channelIdAtom)!
  const durationMode = useRecoilValue(durationModeAtom)
  const customDate = useRecoilValue(customDateAtom)
  const liveChatCounts = useRecoilValue(liveChatCountsAtom)
  const cachedUsers = useRecoilValue(cachedUsersAtom)
  const getPayload = useRankingPayload(durationMode)
  const [displayCopied, setDisplayCopied] = useState(false)
  const [copiedUserName, setCopiedUserName] = useState('')

  useEffect(() => {
    setLoading(true)
    window.api.fetchRanking(channelId, durationMode, getPayload()).then((data) => {
      setRankingRowObject(data)
      setLoading(false)
    })
  }, [durationMode, customDate])

  const copyUserName = (userName: string) => {
    navigator.clipboard.writeText(userName)
    setCopiedUserName(userName)
    setDisplayCopied(true)
  }

  const hideNotice = () => setDisplayCopied(false)

  const rankingData = useMemo(() => {
    const resultRankingObject: RankingRowObject = {}
    if (durationMode === 'live') {
      for (const userId in liveChatCounts) {
        const { name, count } = liveChatCounts[userId]
        const cached = cachedUsers[userId]
        resultRankingObject[userId] = {
          authorChannelId: userId,
          name,
          chatCount: count,
          rank: 0,
          firstChatDate: cached
            ? dayjs.unix(cached.firstChatTime).format('YYYY/MM/DD')
            : '初めまして',
          lastChatDate: cached ? dayjs.unix(cached.lastChatTime).format('YYYY/MM/DD') : '初めまして'
        }
      }
    }
    for (const userId in rankingRowObject) {
      const user = rankingRowObject[userId]
      if (userId in resultRankingObject) {
        const { name, firstChatDate, lastChatDate, chatCount } = user
        resultRankingObject[userId].name = name
        resultRankingObject[userId].firstChatDate = firstChatDate
        resultRankingObject[userId].lastChatDate = lastChatDate
        resultRankingObject[userId].chatCount += chatCount
      } else {
        resultRankingObject[userId] = user
      }
    }
    const rankingRows = Object.values(resultRankingObject).sort((a, b) => b.chatCount - a.chatCount)
    let rank = 1
    return rankingRows.map((row, index) => {
      if (index === 0) {
        return { ...row, rank: 1 }
      }
      if (row.chatCount < rankingRows[index - 1].chatCount) {
        rank = index + 1
      }
      return { ...row, rank }
    })
  }, [rankingRowObject, liveChatCounts, cachedUsers, durationMode])

  return { loading, rankingData, displayCopied, copiedUserName, copyUserName, hideNotice }
}
