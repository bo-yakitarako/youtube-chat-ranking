import { ChangeEvent } from 'react'
import { useRecoilState } from 'recoil'
import { rankingUserSearchValueAtom } from '../../../modules/store'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const useRankingUserSearch = () => {
  const [searchValue, setSearchValue] = useRecoilState(rankingUserSearchValueAtom)

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    delayProcess(() => {
      setSearchValue(event.target.value)
    }, 500)
  }

  return { searchValue, onChange }
}

let process: number | null = null
// eslint-disable-next-line @typescript-eslint/ban-types
const delayProcess = (callback: Function, delay: number) => {
  if (process !== null) {
    window.clearTimeout(process)
  }
  process = window.setTimeout(callback, delay)
}
