import styled from '@emotion/styled'
import { useMainType } from '../modules/useMainType'
import { Ranking } from './ranking/Ranking'
import { NoChannel } from './preparing/NoChannel'
import { NoVideos } from './preparing/NoVideos'
import { NoChats } from './preparing/NoChats'
import { useRecoilValue } from 'recoil'
import { darkModeAtom } from '../modules/store'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const Main: React.FC = () => {
  const mainType = useMainType()
  const darkMode = useRecoilValue(darkModeAtom)
  return (
    <Wrapper darkMode={darkMode}>
      {mainType === 'noChannel' && <NoChannel />}
      {mainType === 'noVideos' && <NoVideos />}
      {mainType === 'noChats' && <NoChats />}
      {mainType === 'ranking' && <Ranking />}
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
