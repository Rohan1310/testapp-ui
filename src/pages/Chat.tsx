import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { setMessages, addMessage, setActiveChat } from '../store/slices/chatSlice'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { useSocket } from '../context/SocketContext'

export default function Chat() {
  const { chatId } = useParams<{ chatId: string }>()
  const { socket, joinChat, leaveChat, sendMessage, shareDocument } = useSocket()
  const dispatch = useDispatch()
  const messages = useSelector((state: RootState) => state.chat.messages)
  const [newMessage, setNewMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (chatId) {
      dispatch(setActiveChat(chatId))
      joinChat(chatId)
      // Fetch messages for this chat
      fetchMessages(chatId)
    }

    return () => {
      if (chatId) {
        leaveChat(chatId)
      }
    }
  }, [chatId, joinChat, leaveChat, dispatch])

  useEffect(() => {
    if (socket) {
      socket.on('new-message', (message) => {
        dispatch(addMessage(message))
      })

      socket.on('document-shared', (data) => {
        dispatch(addMessage({
          id: Date.now(),
          content: `Shared document: ${data.documentUrl}`,
          senderId: data.senderId,
          createdAt: new Date().toISOString(),
        }))
      })

      return () => {
        socket.off('new-message')
        socket.off('document-shared')
      }
    }
  }, [socket, dispatch])

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`)
      const data = await response.json()
      if (response.ok) {
        dispatch(setMessages(data))
      } else {
        console.error('Error fetching messages:', data.message)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && chatId) {
      sendMessage(chatId, newMessage, 1) // Replace 1 with actual user ID
      setNewMessage('')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleShareDocument = () => {
    if (file && chatId) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const documentUrl = e.target?.result as string
        shareDocument(chatId, documentUrl, 1) // Replace 1 with actual user ID
      }
      reader.readAsDataURL(file)
      setFile(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.senderId === 1 ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs p-2 rounded-lg ${message.senderId === 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
        <div className="flex gap-2">
          <Input type="file" onChange={handleFileChange} />
          <Button onClick={handleShareDocument} disabled={!file}>
            Share Document
          </Button>
        </div>
      </div>
    </div>
  )
}

