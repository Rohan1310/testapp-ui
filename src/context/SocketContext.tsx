import React, { createContext, useContext, useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  joinChat: (chatId: string) => void
  leaveChat: (chatId: string) => void
  sendMessage: (chatId: string, content: string, senderId: number) => void
  shareDocument: (chatId: string, documentUrl: string, senderId: number) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  joinChat: () => {},
  leaveChat: () => {},
  sendMessage: () => {},
  shareDocument: () => {},
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider: React.FC = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const newSocket = io('http://localhost:3000') // Replace with your backend URL
    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const joinChat = (chatId: string) => {
    if (socket) {
      socket.emit('join-chat', chatId)
    }
  }

  const leaveChat = (chatId: string) => {
    if (socket) {
      socket.emit('leave-chat', chatId)
    }
  }

  const sendMessage = (chatId: string, content: string, senderId: number) => {
    if (socket) {
      socket.emit('send-message', { chatId, content, senderId })
    }
  }

  const shareDocument = (chatId: string, documentUrl: string, senderId: number) => {
    if (socket) {
      socket.emit('share-document', { chatId, documentUrl, senderId })
    }
  }

  return (
    <SocketContext.Provider value={{ socket, joinChat, leaveChat, sendMessage, shareDocument }}>
      {children}
    </SocketContext.Provider>
  )
}

