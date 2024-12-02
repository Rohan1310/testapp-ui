import { Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import Layout from './components/Layout'
import Home from './pages/Home'
import Chat from './pages/Chat'
import VideoCall from './pages/VideoCall'
import Login from './pages/Login'
import Register from './pages/Register'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Home />} />
          <Route path="chat/:chatId" element={<Chat />} />
          <Route path="video-call/:userId" element={<VideoCall />} />
        </Route>
      </Routes>
    </Provider>
  )
}

export default App

