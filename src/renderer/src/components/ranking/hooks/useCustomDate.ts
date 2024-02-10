import { useRecoilState } from 'recoil'
import { customDateAtom } from '../../../modules/store'
import { Dayjs } from 'dayjs'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const useCustomDate = () => {
  const [[start, end], setCustomDate] = useRecoilState(customDateAtom)

  const startHandler = (newDate: Dayjs) => {
    localStorage.startDate = newDate.format('YYYY-MM-DD')
    setCustomDate([newDate, end])
  }

  const endHandler = (newDate: Dayjs) => {
    localStorage.endDate = newDate.format('YYYY-MM-DD')
    setCustomDate([start, newDate])
  }

  return { start, end, startHandler, endHandler }
}
