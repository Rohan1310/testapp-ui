import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface VideoState {
  isInCall: boolean
  participants: string[]
  isScreenSharing: boolean
}

const initialState: VideoState = {
  isInCall: false,
  participants: [],
  isScreenSharing: false,
}

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    startCall: (state, action: PayloadAction<string[]>) => {
      state.isInCall = true
      state.participants = action.payload
    },
    endCall: (state) => {
      state.isInCall = false
      state.participants = []
      state.isScreenSharing = false
    },
    addParticipant: (state, action: PayloadAction<string>) => {
      state.participants.push(action.payload)
    },
    removeParticipant: (state, action: PayloadAction<string>) => {
      state.participants = state.participants.filter(p => p !== action.payload)
    },
    startScreenShare: (state) => {
      state.isScreenSharing = true
    },
    stopScreenShare: (state) => {
      state.isScreenSharing = false
    },
  },
})

export const { startCall, endCall, addParticipant, removeParticipant, startScreenShare, stopScreenShare } = videoSlice.actions
export default videoSlice.reducer

