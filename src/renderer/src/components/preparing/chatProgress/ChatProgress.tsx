import styled from '@emotion/styled'
import { Box, LinearProgress } from '@mui/material'
import { ProcessText } from './ProcessText'
import { useChatProgress } from './hooks/useChatProgress'

export const ChatProgress: React.FC = () => {
  const { value, title, date } = useChatProgress()
  return (
    <Wrapper>
      <LinearProgress variant="determinate" value={value} sx={{ width: '70%' }} />
      <ProcessText value={value} title={title} date={date} />
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
  gap: 8px;
  width: 100%;
`
