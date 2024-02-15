import { RankingHeader } from './RankingHeader'
import { RankingTable } from './RankingTable'
import { useLiveChat } from './hooks/useLiveChat'
import { useReloadBackground } from './hooks/useReloadBackground'

export const Ranking: React.FC = () => {
  useReloadBackground()
  useLiveChat()
  return (
    <>
      <RankingHeader />
      <RankingTable />
    </>
  )
}
