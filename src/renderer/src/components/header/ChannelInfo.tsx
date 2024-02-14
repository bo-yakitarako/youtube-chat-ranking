import styled from '@emotion/styled'
import { Alert, Box, Button, Snackbar, TextField, Typography } from '@mui/material'
import { useChannelInfo } from './hooks/useChannelInfo'
import { LoadingButton } from '@mui/lab'
import { useRecoilValue } from 'recoil'
import { reloadBackgroundFlagAtom } from '../../modules/store'

export const ChannelInfo: React.FC = () => {
  const {
    register,
    handleSubmit,
    onSubmit,
    channel,
    loading,
    errors,
    channelEdit,
    enableChannelEdit,
    cancelChannelEdit,
    notice,
    hideNotice
  } = useChannelInfo()
  const reloadBackground = useRecoilValue(reloadBackgroundFlagAtom)

  return (
    <Wrapper>
      {channel !== null && !channelEdit ? (
        <>
          <ChannelTitle>{channel.channelTitle}</ChannelTitle>
          {!reloadBackground && (
            <Button variant="outlined" onClick={enableChannelEdit}>
              チャンネル変更
            </Button>
          )}
        </>
      ) : (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            error={!!errors.channelURL}
            helperText={errors.channelURL?.message}
            defaultValue={channel?.channelURL}
            variant="filled"
            size="small"
            label="チャンネルURLいれて"
            {...register('channelURL', {
              required: 'チャンネルのURLをちょうだいな？',
              pattern: {
                message: 'これは無効なチャンネルURLなのだ',
                value: /^https:\/\/www.youtube.com\/.+$/
              }
            })}
            sx={{ width: '240px' }}
          />
          <LoadingButton
            loading={loading}
            variant="outlined"
            type="submit"
            disabled={!!errors.channelURL || loading}
          >
            保存
          </LoadingButton>
          {channel !== null && (
            <Button
              variant="outlined"
              color="secondary"
              disabled={loading}
              onClick={cancelChannelEdit}
            >
              キャンセル
            </Button>
          )}
        </Form>
      )}
      <Snackbar
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        open={notice}
        onClose={hideNotice}
        key="disabled-channel-notice"
        autoHideDuration={8000}
      >
        <Alert onClose={hideNotice} severity="error" variant="filled" sx={{ width: '100%' }}>
          そのURLじゃチャンネルが見つからなかったのだ...
        </Alert>
      </Snackbar>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-grow: 1;
`
const Form = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
`

const ChannelTitle = styled(Typography)`
  font-weight: bold;
  font-size: 20px;
  max-width: 320px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`
