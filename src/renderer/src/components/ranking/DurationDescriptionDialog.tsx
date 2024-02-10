import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from '@mui/material'
import { getDurationDates } from '../../modules/durationUtils'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

/* eslint-disable @typescript-eslint/explicit-function-return-type, react/prop-types */
export const DurationDescriptionDialog: React.FC<Props> = ({ open, setOpen }) => {
  const handleClickClose = () => setOpen(false)

  const thisWeek = getDurationDates('thisWeek')
  const thisWeekDiff = thisWeek[1].diff(thisWeek[0], 'd') + 1
  const pastWeek = getDurationDates('pastWeek')
  const pastWeekDiff = pastWeek[1].diff(pastWeek[0], 'd')
  const thisMonth = getDurationDates('thisMonth')
  const thisMonthDiff = thisMonth[1].diff(thisMonth[0], 'd') + 1
  const pastMonth = getDurationDates('pastMonth')
  const pastMonthDiff = pastMonth[1].diff(pastMonth[0], 'd')
  const thisYear = getDurationDates('thisYear')
  const thisYearDiff = thisYear[1].diff(thisYear[0], 'd') + 1
  const pastYear = getDurationDates('pastYear')
  const pastYearDiff = pastYear[1].diff(pastYear[0], 'd')

  return (
    <Dialog open={open} onClose={handleClickClose}>
      <DialogTitle>期間について</DialogTitle>
      <DialogContent>
        <DialogContentText>期間の各項目の詳細は以下の通りなのだ</DialogContentText>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">ライブ</Typography>
                </TableCell>
                <TableCell>現在配信しているライブのチャットのみを数えますわよ</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">アーカイブ</Typography>
                </TableCell>
                <TableCell>
                  過去アーカイブのうち1つのライブのチャットのみ。アーカイブの選択画面がでるよ
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">今週</Typography>
                </TableCell>
                <TableCell>
                  月曜から今までの今週のライブのチャットを数えます。
                  {thisWeekDiff === 1
                    ? '月曜の今日だけが対象ですわよ'
                    : `${thisWeek[0].format('M月D日')}から今日までの${thisWeekDiff}日間が対象ですわよ`}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">週間</Typography>
                </TableCell>
                <TableCell>
                  過去1週間のライブのチャットを数えます。{pastWeek[0].format('M月D日')}
                  から今日までの{pastWeekDiff}日間が対象ですわよ
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">今月</Typography>
                </TableCell>
                <TableCell>
                  1日から今までの今月のライブのチャットを数えます。
                  {thisMonthDiff === 1
                    ? '1日の今日だけが対象ですわよ'
                    : `${thisMonth[0].format('M月D日')}から今日までの${thisMonthDiff}日間が対象ですわよ`}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">月間</Typography>
                </TableCell>
                <TableCell>
                  過去1か月間のライブのチャットを数えます。{pastMonth[0].format('M月D日')}
                  から今日までの{pastMonthDiff}日間が対象ですわよ
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">今年</Typography>
                </TableCell>
                <TableCell>
                  今年の1月1日から今までのライブのチャットを数えます。
                  {thisYearDiff === 1
                    ? '1月1日の今日だけが対象ですわよ'
                    : `${thisYear[0].format('YYYY年M月D日')}から今日までの${thisYearDiff}日間が対象ですわよ`}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">年間</Typography>
                </TableCell>
                <TableCell>
                  過去1年間のライブのチャットを数えます。{pastYear[0].format('YYYY年M月D日')}
                  から今日までの{pastYearDiff}日間が対象ですわよ
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">全期間</Typography>
                </TableCell>
                <TableCell>全ライブ配信のチャットを数えますわよ</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">カスタム</Typography>
                </TableCell>
                <TableCell>何日から何日までか自由に指定しますぞ</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClickClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  )
}
