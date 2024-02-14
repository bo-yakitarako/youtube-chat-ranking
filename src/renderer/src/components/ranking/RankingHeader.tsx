import styled from '@emotion/styled'
import { Info } from '@mui/icons-material'
import { Box, Button, IconButton, MenuItem, Select, Typography } from '@mui/material'
import { useState } from 'react'
import { DurationDescriptionDialog } from './DurationDescriptionDialog'
import { DatePicker } from '@mui/x-date-pickers'
import { useDurationSelect } from './hooks/useDurationSelect'
import { useCustomDate } from './hooks/useCustomDate'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { mainTypeAtom, reloadBackgroundFlagAtom } from '../../modules/store'
import { useRankingHeaderTitle } from './hooks/useRankingHeaderTitle'
import { durationTitleDict } from '../../modules/durationUtils'
import { DurationMode } from '../../../../preload/dataType'

export const RankingHeader: React.FC = () => {
  const [durationDescriptionDialogOpen, setDurationDescriptionDialogOpen] = useState(false)
  const { durationMode, onSelect } = useDurationSelect()
  const { start, end, startHandler, endHandler } = useCustomDate()
  const rankingTitle = useRankingHeaderTitle()
  const reloadBackground = useRecoilValue(reloadBackgroundFlagAtom)
  const setMainType = useSetRecoilState(mainTypeAtom)

  return (
    <Wrapper>
      <Title>
        <Typography component="h2">{rankingTitle}</Typography>
      </Title>
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
        {durationMode === 'archive' && (
          <Button
            variant="outlined"
            size="large"
            onClick={() => setMainType('archiveSearch')}
            disabled={reloadBackground}
          >
            {reloadBackground ? '更新中はちょいお待ちね' : 'アーカイブ選択'}
          </Button>
        )}
        <StyledSelect value={durationMode} onChange={onSelect} disabled={reloadBackground}>
          {(Object.keys(durationTitleDict) as DurationMode[]).map((mode) => (
            <MenuItem key={mode} value={mode}>
              {durationTitleDict[mode]}
            </MenuItem>
          ))}
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
`

const Title = styled(Box)`
  display: flex;
  align-items: center;
  flex-grow: 1;
  > h2 {
    max-width: 420px;
    font-size: 24px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
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
