import styled from '@emotion/styled'
import { Info, Search } from '@mui/icons-material'
import { Grid, IconButton, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useArchiveSearch } from './hooks/useArchiveSearch'
import { SearchDetailDialog } from './SearchDetailDialog'
import { useState } from 'react'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const ArchiveSearch: React.FC = () => {
  const { searchResult, onChange, selectVideo } = useArchiveSearch()
  const [dialogOpen, setDialogOpen] = useState(false)
  return (
    <>
      <Header>
        <Title>アーカイブ選択</Title>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <IconButton color="info" onClick={() => setDialogOpen(true)}>
            <Info />
          </IconButton>
          <Search />
          <TextField variant="standard" onChange={onChange} sx={{ width: '320px' }} />
        </Box>
        <SearchDetailDialog open={dialogOpen} setOpen={setDialogOpen} />
      </Header>
      <ArchivesWrapper>
        <Grid container>
          {searchResult.map(({ id, title, date, thumbnail }) => (
            <Grid item key={id} xs={3} xl={2}>
              <Item onClick={() => selectVideo(id)}>
                <Typography>{date}</Typography>
                <img alt="" src={thumbnail} />
                <Typography>{title}</Typography>
              </Item>
            </Grid>
          ))}
        </Grid>
      </ArchivesWrapper>
    </>
  )
}

const Header = styled(Box)`
  display: flex;
  align-items: center;
`

const Title = styled(Typography)`
  font-weight: bold;
  font-size: 20px;
  flex-grow: 1;
`

const ArchivesWrapper = styled(Box)`
  flex-grow: 1;
  margin-top: 16px;
  overflow-y: scroll;
`

const Item = styled(Box)`
  padding: 8px;
  border-radius: 8px;
  height: 100%;
  color: ${({ theme }) => theme.palette.text.secondary};

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.palette.action.hover};
  }

  > img {
    width: 100%;
  }
  > p {
    overflow: hidden;
    display: -webkit-box;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    font-size: 13px;
  }
`
