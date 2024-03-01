import styled from '@emotion/styled'
import { useMainType } from '../modules/useMainType'
import { Ranking } from './ranking/Ranking'
import { NoChannel } from './preparing/NoChannel'
import { NoVideos } from './preparing/NoVideos'
import { NoChats } from './preparing/NoChats'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { darkModeAtom, videosAtom } from '../modules/store'
import { ArchiveSearch } from './archiveSearch/ArchiveSearch'
import { useEffect } from 'react'
import { VideoObject } from '../../../preload/dataType'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const Main: React.FC = () => {
  const mainType = useMainType()
  const darkMode = useRecoilValue(darkModeAtom)
  const setVideos = useSetRecoilState(videosAtom)

  useEffect(() => {
    // @ts-ignore バス間違えた
    window.ipcRenderer.on('videos', (e, videos: VideoObject) => {
      setVideos(videos)
    })
  }, [])

  return (
    <Wrapper darkMode={darkMode}>
      {mainType === 'noChannel' && <NoChannel />}
      {mainType === 'noVideos' && <NoVideos />}
      {mainType === 'noChats' && <NoChats />}
      {mainType === 'ranking' && <Ranking />}
      {mainType === 'archiveSearch' && <ArchiveSearch />}
    </Wrapper>
  )
}

const Wrapper = styled.main<{ darkMode: boolean }>`
  display: flex;
  padding: 16px 24px;
  flex-direction: column;
  height: calc(100vh - 75px);
  color-scheme: ${({ darkMode }) => (darkMode ? 'dark' : 'light')};
`
