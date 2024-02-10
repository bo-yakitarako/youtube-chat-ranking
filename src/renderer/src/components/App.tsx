import {
  CssBaseline,
  Experimental_CssVarsProvider as CssVarsProvider,
  ThemeProvider,
  createTheme
} from '@mui/material'
import { Header } from './header/Header'
import { RecoilRoot } from 'recoil'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { jaJP } from '@mui/material/locale'
import { jaJP as jaJPD } from '@mui/x-date-pickers/locales'
import { Main } from './Main'

const theme = createTheme({}, jaJP, jaJPD)

export const App: React.FC = () => {
  return (
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <CssVarsProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
            <CssBaseline />
            <Header />
            <Main />
          </LocalizationProvider>
        </CssVarsProvider>
      </ThemeProvider>
    </RecoilRoot>
  )
}
