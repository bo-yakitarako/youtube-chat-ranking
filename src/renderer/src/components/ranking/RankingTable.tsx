import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useRanking } from './hooks/useRanking'
import styled from '@emotion/styled'
import { ContentCopy } from '@mui/icons-material'

export const RankingTable: React.FC = () => {
  const { loading, rankingData, copyUserName } = useRanking()
  return (
    <TableContainer component={Paper} sx={{ flexGrow: 1, marginTop: '16px' }}>
      {loading ? (
        <LoadingWrapper>
          <CircularProgress />
        </LoadingWrapper>
      ) : (
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>順位</TableCell>
              <TableCell>名前</TableCell>
              <TableCell>コメント数</TableCell>
              <TableCell>最初の日</TableCell>
              <TableCell>最後の日</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rankingData.map(
              ({ authorChannelId, name, chatCount, rank, firstChatDate, lastChatDate }, index) => (
                <TableRow key={authorChannelId}>
                  <TableCell>{rankingData[index - 1]?.rank === rank ? '' : rank}</TableCell>
                  <NameCell>
                    <div onClick={() => copyUserName(name)}>
                      <Typography>{name}</Typography>
                      <ContentCopy />
                    </div>
                  </NameCell>
                  <TableCell>{chatCount}</TableCell>
                  <TableCell>{firstChatDate}</TableCell>
                  <TableCell>{lastChatDate}</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  )
}

const LoadingWrapper = styled(Box)`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`

const NameCell = styled(TableCell)`
  width: 320px;
  max-width: 320px;

  div {
    display: flex;
    align-items: center;
    width: 100%;
    > p {
      flex-grow: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    > svg {
      display: none;
    }
    &:hover {
      cursor: pointer;
      > svg {
        display: inline-block;
      }
    }
  }
`
