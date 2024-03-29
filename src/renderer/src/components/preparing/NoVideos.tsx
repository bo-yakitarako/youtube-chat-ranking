import { LoadingButton } from '@mui/lab'
import { Greet, PrepareBase } from './PrepareBase'
import { Send } from '@mui/icons-material'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { channelIdAtom, reloadBackgroundFlagAtom, videosAtom } from '../../modules/store'

export const NoVideos: React.FC = () => {
  const channelId = useRecoilValue(channelIdAtom)!
  const [loading, setLoading] = useRecoilState(reloadBackgroundFlagAtom)
  const setVideos = useSetRecoilState(videosAtom)
  const loadVideos = async (): Promise<void> => {
    setLoading(true)
    const videos = await window.api.getVideosFromYouTube(channelId)
    setVideos(videos)
    setLoading(false)
  }
  return (
    <PrepareBase>
      <Greet>YouTubeチャンネルにある配信アーカイブを取得するよ</Greet>
      <LoadingButton
        loading={loading}
        variant="outlined"
        onClick={loadVideos}
        disabled={loading}
        loadingPosition="start"
        size="large"
        startIcon={<Send />}
      >
        {loading ? '取得中...ちょっち時間もらうわ' : '配信アーカイブの取得'}
      </LoadingButton>
    </PrepareBase>
  )
}
