import styled from '@emotion/styled'
import { Info } from '@mui/icons-material'
import { Box, Button, IconButton, MenuItem, Select, Typography } from '@mui/material'
import { useState } from 'react'
import { DurationDescriptionDialog } from './DurationDescriptionDialog'
import { DatePicker } from '@mui/x-date-pickers'
import { useDurationSelect } from './hooks/useDurationSelect'
import { useCustomDate } from './hooks/useCustomDate'
import { useSetRecoilState } from 'recoil'
import { mainTypeAtom } from '../../modules/store'

export const RankingHeader: React.FC = () => {
  const [durationDescriptionDialogOpen, setDurationDescriptionDialogOpen] = useState(false)
  const { durationMode, onSelect } = useDurationSelect()
  const { start, end, startHandler, endHandler } = useCustomDate()
  const setMainType = useSetRecoilState(mainTypeAtom)
  return (
    <Wrapper>
      <Typography component="h2">ランキング</Typography>
      <DurationWrapper>
        <IconButton
          size="small"
          color="info"
          onClick={() => setDurationDescriptionDialogOpen(true)}
        >
          <Info />
        </IconButton>
        {durationMode === 'custom' && (
          <>
            <StyledPicker
              label="最初の日"
              format="YYYY年M月D日"
              value={start}
              maxDate={end}
              // @ts-ignore 先生ちょっと型定義つかれたわ
              onChange={startHandler}
            />
            <StyledPicker
              label="最後の日"
              format="YYYY年M月D日"
              value={end}
              minDate={start}
              // @ts-ignore なんでお前みたいなや、型定義エラーなキャラ、型エラキャラがおる
              onChange={endHandler}
              disableFuture
            />
          </>
        )}
        {durationMode === 'pastLive' && (
          <Button variant="outlined" size="large" onClick={() => setMainType('archiveSearch')}>
            アーカイブ選択
          </Button>
        )}
        <StyledSelect value={durationMode} onChange={onSelect}>
          <MenuItem value="currentLive">ライブ</MenuItem>
          <MenuItem value="pastLive">アーカイブ</MenuItem>
          <MenuItem value="thisWeek">今週</MenuItem>
          <MenuItem value="pastWeek">週間</MenuItem>
          <MenuItem value="thisMonth">今月</MenuItem>
          <MenuItem value="pastMonth">月間</MenuItem>
          <MenuItem value="thisYear">今年</MenuItem>
          <MenuItem value="pastYear">年間</MenuItem>
          <MenuItem value="all">全期間</MenuItem>
          <MenuItem value="custom">カスタム</MenuItem>
        </StyledSelect>
      </DurationWrapper>
      <DurationDescriptionDialog
        open={durationDescriptionDialogOpen}
        setOpen={setDurationDescriptionDialogOpen}
      />
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  align-items: center;
  > h2 {
    flex-grow: 1;
    font-size: 32px;
  }
`

const DurationWrapper = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
`

const StyledSelect = styled(Select)`
  width: 130px;
`

const StyledPicker = styled(DatePicker)`
  width: 190px;
`
