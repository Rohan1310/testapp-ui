import { useTheme } from '../context/ThemeContext'
import { Button } from './ui/button'
import { Moon, Sun } from 'lucide-react'

export default function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex justify-between items-center p-4 border-b">
      <h1 className="text-2xl font-bold">Skype Clone</h1>
      <Button variant="ghost" size="icon" onClick={toggleTheme}>
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    </header>
  )
}

