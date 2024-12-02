import { NavLink } from 'react-router-dom'
import { Home, MessageSquare, Video, Phone } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-16 bg-secondary">
      <nav className="flex flex-col items-center py-4 space-y-4">
        <NavLink to="/" className="p-2 rounded-lg hover:bg-primary">
          <Home className="h-6 w-6" />
        </NavLink>
        <NavLink to="/chat" className="p-2 rounded-lg hover:bg-primary">
          <MessageSquare className="h-6 w-6" />
        </NavLink>
        <NavLink to="/video-call" className="p-2 rounded-lg hover:bg-primary">
          <Video className="h-6 w-6" />
        </NavLink>
        <NavLink to="/call" className="p-2 rounded-lg hover:bg-primary">
          <Phone className="h-6 w-6" />
        </NavLink>
      </nav>
    </aside>
  )
}

