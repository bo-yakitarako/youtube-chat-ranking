import type { youtube_v3 } from 'googleapis'

export type Channel = {
  id: string
  channelTitle: string
  channelURL: string
}

export type ChannelObject = { [channelId in string]: Channel }

export type Video = {
  id: string
  title: string
  hiraganaTitle: string
  thumbnails: youtube_v3.Schema$ThumbnailDetails
  publishedAt: string
  channelId: string
  channelTitle: string
  viewCount: string
  likeCount: string
  chatCached: boolean
}

export type VideoObject = { [videoId in string]: Video }

export type ChatCounts = {
  [channelId in string]: {
    name: string
    count: number
  }
}

export type ChatCountsObject = { [videoId in string]: ChatCounts }

type IconType = 'YOUTUBE_ROUND' | 'MODERATOR'

export type ArchiveChat = {
  clickTrackingParams: string
  replayChatItemAction: {
    actions: {
      clickTrackingParams: string
      addChatItemAction?: {
        item: {
          liveChatTextMessageRenderer?: {
            message: {
              runs: { text: string }[]
            }
            authorName: { simpleText: string }
            authorPhoto: {
              thumbnails: { url: string; width: number; height: number }[]
            }
            contextMenuEndpoint: {
              clickTrackingParams: string
              commandMetadata: {
                webCommandMetadata: {
                  ignoreNavigation: boolean
                }
              }
              liveChatItemContextMenuEndpoint: {
                params: string
              }
            }
            id: string
            timestampUsec: string
            authorBadges: {
              liveChatAuthorBadgeRenderer: {
                icon: { iconType: IconType }
                tooltip: string
                accessibility: {
                  accessibilityData: {
                    label: string
                  }
                }
              }
            }[]
            authorExternalChannelId: string
            contextMenuAccessibility: {
              accessibilityData: {
                label: string
              }
            }
            timestampText: {
              simpleText: string
            }
            trackingParams: string
          }
        }
        clientId: string
      }
    }[]
    videoOffsetTimeMsec: string
  }
}

export type RankingUser = {
  id: string
  name: string
  firstChatTime: number
  lastChatTime: number
}

export type RankingUserObject = { [channelId in string]: RankingUser }

export type DurationMode =
  | 'live'
  | 'archive'
  | 'thisWeek'
  | 'pastWeek'
  | 'thisMonth'
  | 'pastMonth'
  | 'thisYear'
  | 'pastYear'
  | 'all'
  | 'custom'

export type RankingPayload = string | [number, number] | undefined

export type RankingRow = {
  authorChannelId: string
  name: string
  chatCount: number
  firstChatDate: string
  lastChatDate: string
}

export type RankingRowObject = { [userId in string]: RankingRow }

export type LiveStore = {
  liveChatCounts: ChatCounts
  liveChatIds: string[]
}
