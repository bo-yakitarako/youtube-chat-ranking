import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { channelAtom, channelIdAtom, resetChannelDataSelector } from '../../../modules/store'

type Input = {
  channelURL: string
}

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const useChannelInfo = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Input>()
  const [loading, setLoading] = useState(false)
  const [channelEdit, setChannelEdit] = useState(false)
  const [notice, setNotice] = useState(false)
  const setChannelId = useSetRecoilState(channelIdAtom)
  const [channel, setChannel] = useRecoilState(channelAtom)
  const resetData = useSetRecoilState(resetChannelDataSelector)

  const onSubmit: SubmitHandler<Input> = async (data) => {
    setLoading(true)
    const channelId = await window.api.registerChannel(data.channelURL)
    setChannelEdit(false)
    if (channelId === null) {
      setNotice(true)
      setLoading(false)
      return
    }
    localStorage.channelId = channelId
    setChannelId(channelId)
    const channel = await window.api.getChannel(channelId)
    setChannel(channel)
    resetData()
    setLoading(false)
  }

  const enableChannelEdit = () => setChannelEdit(true)
  const cancelChannelEdit = () => setChannelEdit(false)

  const hideNotice = () => setNotice(false)

  return {
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
  }
}
