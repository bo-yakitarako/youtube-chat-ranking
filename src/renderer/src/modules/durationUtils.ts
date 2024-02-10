import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ja'
import duration from 'dayjs/plugin/duration'
import updateLocale from 'dayjs/plugin/updateLocale'
import { DurationMode } from '../../../preload/dataType'

dayjs.extend(duration)
dayjs.extend(updateLocale)

dayjs.updateLocale('en', { weekStart: 1 })

export const getDurationDates = (durationMode: DurationMode): [Dayjs, Dayjs] => {
  const today = dayjs()
  switch (durationMode) {
    case 'thisWeek':
      return [today.startOf('w'), today]
    case 'pastWeek':
      return [today.subtract(1, 'w'), today]
    case 'thisMonth':
      return [today.startOf('M'), today]
    case 'pastMonth':
      return [today.subtract(1, 'M'), today]
    case 'thisYear':
      return [today.startOf('y'), today]
    case 'pastYear':
      return [today.subtract(1, 'y'), today]
    default:
      return [today, today]
  }
}
