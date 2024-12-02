import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { startCall, endCall, addParticipant, removeParticipant, startScreenShare, stopScreenShare } from '../store/slices/videoSlice'
import { Button } from '../components/ui/button'
import { useSocket } from '../context/SocketContext'

export default function VideoCall() {
  const { userId } = useParams<{ userId: string }>()
  const { socket } = useSocket()
  const dispatch = useDispatch()
  const { isInCall, participants, isScreenSharing } = useSelector((state: RootState) => state.video)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideosRef = useRef<{ [key: string]: HTMLVideoElement }>({})
  const peerConnectionsRef = useRef<{ [key: string]: RTCPeerConnection }>({})
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    if (socket) {
      socket.on('offer', handleOffer)
      socket.on('answer', handleAnswer)
      socket.on('ice-candidate', handleIceCandidate)
      socket.on('user-joined', handleUserJoined)
      socket.on('user-left', handleUserLeft)
      socket.on('screen-share-started', handleScreenShareStarted)
      socket.on('screen-share-stopped', handleScreenShareStopped)

      return () => {
        socket.off('offer')
        socket.off('answer')
        socket.off('ice-candidate')
        socket.off('user-joined')
        socket.off('user-left')
        socket.off('screen-share-started')
        socket.off('screen-share-stopped')
      }
    }
  }, [socket])

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      dispatch(startCall([userId!]))
      if (socket) {
        socket.emit('join-call', { roomId: userId })
      }
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }

  const handleUserJoined = (user: string) => {
    dispatch(addParticipant(user))
    if (localStream) {
      createPeerConnection(user, localStream)
    }
  }

  const handleUserLeft = (user: string) => {
    dispatch(removeParticipant(user))
    if (peerConnectionsRef.current[user]) {
      peerConnectionsRef.current[user].close()
      delete peerConnectionsRef.current[user]
    }
    if (remoteVideosRef.current[user]) {
      remoteVideosRef.current[user].srcObject = null
      delete remoteVideosRef.current[user]
    }
  }

  const createPeerConnection = (user: string, stream: MediaStream) => {
    const peerConnection = new RTCPeerConnection()
    peerConnectionsRef.current[user] = peerConnection

    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream)
    })

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', { target: user, candidate: event.candidate })
      }
    }

    peerConnection.ontrack = (event) => {
      if (!remoteVideosRef.current[user]) {
        remoteVideosRef.current[user] = document.createElement('video')
        remoteVideosRef.current[user].autoplay = true
        remoteVideosRef.current[user].playsInline = true
        document.getElementById('remoteVideos')?.appendChild(remoteVideosRef.current[user])
      }
      remoteVideosRef.current[user].srcObject = event.streams[0]
    }

    return peerConnection
  }

  const handleOffer = async (data: { caller: string; sdp: RTCSessionDescriptionInit }) => {
    if (!peerConnectionsRef.current[data.caller] && localStream) {
      const peerConnection = createPeerConnection(data.caller, localStream)
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      if (socket) {
        socket.emit('answer', { target: data.caller, caller: userId, sdp: answer })
      }
    }
  }

  const handleAnswer = async (data: { caller: string; sdp: RTCSessionDescriptionInit }) => {
    const peerConnection = peerConnectionsRef.current[data.caller]
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
    }
  }

  const handleIceCandidate = async (data: { sender: string; candidate: RTCIceCandidateInit }) => {
    const peerConnection = peerConnectionsRef.current[data.sender]
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
    }
  }

  const handleScreenShareStarted = (stream: MediaStream) => {
    dispatch(startScreenShare())
    participants.forEach((participant) => {
      const peerConnection = peerConnectionsRef.current[participant]
      if (peerConnection) {
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream)
        })
      }
    })
  }

  const handleScreenShareStopped = () => {
    dispatch(stopScreenShare())
  }

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      if (socket) {
        socket.emit('start-screen-share', { roomId: userId, stream })
      }
      handleScreenShareStarted(stream)
    } catch (error) {
      console.error('Error starting screen share:', error)
    }
  }

  const stopScreenShare = () => {
    if (socket) {
      socket.emit('stop-screen-share', { roomId: userId })
    }
    handleScreenShareStopped()
  }

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close())
    peerConnectionsRef.current = {}
    remoteVideosRef.current = {}
    dispatch(endCall())
    if (socket) {
      socket.emit('leave-call', { roomId: userId })
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center space-x-4 mb-4">
        <video ref={localVideoRef} autoPlay muted className="w-1/4 h-auto border rounded" />
        <div id="remoteVideos" className="flex flex-wrap justify-center" />
      </div>
      <div className="space-x-2">
        {!isInCall ? (
          <Button onClick={startCall}>Start Call</Button>
        ) : (
          <>
            <Button onClick={endCall} variant="destructive">End Call</Button>
            {isScreenSharing ? (
              <Button onClick={stopScreenShare}>Stop Screen Share</Button>
            ) : (
              <Button onClick={startScreenShare}>Start Screen Share</Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

