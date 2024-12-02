import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Message {
  id: number
  content: string
  senderId: number
  createdAt: string
}

interface ChatState {
  messages: Message[]
  activeChat: string | null
}

const initialState: ChatState = {
  messages: [],
  activeChat: null,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
    },
    setActiveChat: (state, action: PayloadAction<string>) => {
      state.activeChat = action.payload
    },
  },
})

export const { setMessages, addMessage, setActiveChat } = chatSlice.actions
export default chatSlice.reducer

