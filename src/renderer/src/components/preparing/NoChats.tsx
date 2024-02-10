import { Button } from '@mui/material'
import { Greet, PrepareBase } from './PrepareBase'
import { ChatProgress } from './chatProgress/ChatProgress'
import { useNoChats } from './chatProgress/hooks/useNoChats'

export const NoChats: React.FC = () => {
  const { gathering, gatherChats } = useNoChats()
  return (
    <PrepareBase>
      <Greet>
        取得した配信アーカイブのチャットを取得しますぞい
        <br />
        時間かかるからベーゴマでも遊んで待ってな
      </Greet>
      {!gathering ? (
        <Button variant="outlined" size="large" onClick={gatherChats}>
          チャット取得開始
        </Button>
      ) : (
        <ChatProgress />
      )}
    </PrepareBase>
  )
}
