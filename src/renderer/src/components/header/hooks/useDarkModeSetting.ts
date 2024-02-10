import { useRecoilState } from 'recoil'
import { darkModeAtom } from '../../../modules/store'
import { useColorScheme } from '@mui/material'

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const useDarkModeSetting = () => {
  const [isDarkMode, setIsDarkMode] = useRecoilState(darkModeAtom)
  const { setMode } = useColorScheme()
  const toggleDarkMode = () => {
    setIsDarkMode((isDarkMode) => {
      setMode(isDarkMode ? 'light' : 'dark')
      localStorage.darkMode = !isDarkMode
      return !isDarkMode
    })
  }
  return { isDarkMode, toggleDarkMode }
}
