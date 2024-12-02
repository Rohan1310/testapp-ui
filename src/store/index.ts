import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import chatReducer from './slices/chatSlice'
import videoReducer from './slices/videoSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    video: videoReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

