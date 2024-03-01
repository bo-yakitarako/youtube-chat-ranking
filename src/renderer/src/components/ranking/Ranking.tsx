import { SnackbarProvider } from 'notistack'
import { RankingHeader } from './RankingHeader'
import { RankingTable } from './RankingTable'
import { useLiveChat } from './hooks/useLiveChat'
import { useReloadBackground } from './hooks/useReloadBackground'

export const Ranking: React.FC = () => {
  useReloadBackground()
  useLiveChat()
  return (
    <SnackbarProvider maxSnack={3}>
      <RankingHeader />
      <RankingTable />
    </SnackbarProvider>
  )
}
