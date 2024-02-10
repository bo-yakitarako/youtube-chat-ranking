import styled from '@emotion/styled'
import { Box, CircularProgress, Typography } from '@mui/material'
import { Dayjs } from 'dayjs'

type Props = {
  value: number
  title: string
  date: Dayjs
}

/* eslint-disable react/prop-types */
export const ProcessText: React.FC<Props> = ({ value, title, date }) => {
  return (
    <Wrapper>
      <ProgressMain>
        <PercentageWrapper>
          <CircularProgress />
          <PercentageTextContainer>
            <Typography variant="caption" component="div" color="text.secondary">
              {Math.round(value)}%
            </Typography>
          </PercentageTextContainer>
        </PercentageWrapper>
        <VideoTitle color="text.secondary">{title}</VideoTitle>
      </ProgressMain>
      <Typography color="text.secondary">{date.format('YYYY/MM/DD')}</Typography>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  width: 70%;
  align-items: center;
`

const ProgressMain = styled(Box)`
  display: flex;
  align-items: center;
  flex-grow: 1;
  overflow: hidden;
  gap: 8px;
`

const VideoTitle = styled(Typography)`
  max-width: calc(100% - 48px);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const PercentageWrapper = styled(Box)`
  position: relative;
  display: inline-flex;
`
const PercentageTextContainer = styled(Box)`
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`
