import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from '@mui/material'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

/* eslint-disable react/prop-types */

export const SearchDetailDialog: React.FC<Props> = ({ open, setOpen }) => {
  const handleClose = (): void => setOpen(false)
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>アーカイブ選択の検索</DialogTitle>
      <DialogContent>
        <Typography
          component="h2"
          fontWeight="bold"
          color="text.secondary"
          margin="0 0 8px"
          fontSize="18px"
        >
          文字での検索
        </Typography>
        <DialogContentText>
          半角スペースか全角スペースで区切って動画タイトルに複数の単語が含まれているかを検索しますわよ
          <br />
          漢字の読みがなを打ってもちゃんと絞り込んでくれるのだ(そのせいで数字も読みがなで検索してしまうがなガハハ)
        </DialogContentText>
        <Typography
          component="h2"
          fontWeight="bold"
          color="text.secondary"
          margin="8px 0"
          fontSize="18px"
        >
          日付範囲指定コマンド
        </Typography>
        <DialogContentText>
          「from:2023-10-23」と入力すると2023年10月23日以降の動画を、「until:2024-2-1」と入力すると2024年2月1日までの動画を絞りこむのだ。どちらか片方を入力してもいいし、両方入力しても問題ないのだ
        </DialogContentText>
        <Typography
          component="h2"
          fontWeight="bold"
          color="text.secondary"
          margin="8px 0"
          fontSize="18px"
        >
          入力例
        </Typography>
        <DialogContentText>
          「ざつだん from:2023-10-23 until:2024-1-1 今日」
          <br />
          {'=> '}
          「雑談」や「ざつだん」が含まれ、さらに「きょう」や「今日」といったものも含まれるタイトルの動画で、2023年10月23日から2024年1月1日までの範囲のものを表示しますぞい
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  )
}
