import { useRecoilState } from 'recoil'
import { durationModeAtom } from '../../../modules/store'
import { SelectChangeEvent } from '@mui/material'
import { DurationMode } from '../../../modules/durationUtils'

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const useDurationSelect = () => {
  const [durationMode, setDurationMode] = useRecoilState(durationModeAtom)

  const onSelect = (event: SelectChangeEvent<unknown>) => {
    setDurationMode(event.target.value as DurationMode)
    localStorage.durationMode = event.target.value
  }

  return { durationMode, onSelect }
}
