import styled from '@emotion/styled'
import { Box, Typography } from '@mui/material'

type Props = {
  children?: React.ReactNode
}

// eslint-disable-next-line react/prop-types
export const PrepareBase: React.FC<Props> = ({ children }) => <BaseWrapper>{children}</BaseWrapper>

const BaseWrapper = styled(Box)`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 8px;
`

export const Greet = styled(Typography)`
  text-align: center;
  font-size: 20px;
  line-height: 32px;
`
