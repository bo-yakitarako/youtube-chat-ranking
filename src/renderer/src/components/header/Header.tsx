import styled from '@emotion/styled'
import {
  AppBar,
  Box,
  FormGroup,
  IconButton,
  Switch,
  TextField,
  Toolbar,
  Tooltip,
  useColorScheme
} from '@mui/material'
import { useDarkModeSetting } from './hooks/useDarkModeSetting'
import { useEffect } from 'react'
import { ChannelInfo } from './ChannelInfo'
import { Cached, Search } from '@mui/icons-material'
import { useRecoilState, useRecoilValue } from 'recoil'
import { mainTypeAtom, reloadBackgroundFlagAtom } from '../../modules/store'
import { useRankingUserSearch } from '../ranking/hooks/useRankingUserSearch'

/* eslint-disable @typescript-eslint/explicit-function-return-type */

const defaultDarkMode = localStorage.darkMode === 'true'

export const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkModeSetting()
  const { setMode } = useColorScheme()
  const { searchValue, onChange } = useRankingUserSearch()
  const [reloadBackground, setReloadBackground] = useRecoilState(reloadBackgroundFlagAtom)
  const mainType = useRecoilValue(mainTypeAtom)

  const reloadBackgroundStart = () => {
    if (reloadBackground) {
      return
    }
    setReloadBackground(true)
  }

  useEffect(() => {
    const storageSetting = localStorage.darkMode === 'true'
    setMode(storageSetting ? 'dark' : 'light')
  }, [])

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="inherit">
        <Toolbar sx={{ height: '75px' }}>
          <ChannelInfo />
          <OptionWrapper>
            {mainType === 'ranking' && (
              <>
                <Search />
                <TextField
                  size="small"
                  variant="standard"
                  placeholder="ユーザー検索"
                  defaultValue={searchValue}
                  onChange={onChange}
                />
                <Tooltip title={reloadBackground ? '更新中...' : '更新'}>
                  <IconButton onClick={reloadBackgroundStart}>
                    <ReloadingContainer animate={reloadBackground}>
                      <Cached />
                    </ReloadingContainer>
                  </IconButton>
                </Tooltip>
              </>
            )}
            <DarkThemeSwitch
              defaultChecked={defaultDarkMode}
              value={isDarkMode}
              onChange={toggleDarkMode}
            />
          </OptionWrapper>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

const OptionWrapper = styled(FormGroup)`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 4px;
`

const ReloadingContainer = styled.span<{ animate: boolean }>`
  display: inline-flex;
  align-items: center;

  ${({ animate }) =>
    animate
      ? `
    animation: rotation 2s linear infinite;
    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `
      : ''}
`

const DarkThemeSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff'
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be'
      }
    }
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff'
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`
    }
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2
  }
}))
