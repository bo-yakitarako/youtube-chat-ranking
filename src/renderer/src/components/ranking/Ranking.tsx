import { RankingHeader } from './RankingHeader'
import { RankingTable } from './RankingTable'
import { useReloadBackground } from './hooks/useReloadBackground'

export const Ranking: React.FC = () => {
  useReloadBackground()
  return (
    <>
      <RankingHeader />
      <RankingTable />
    </>
  )
}
