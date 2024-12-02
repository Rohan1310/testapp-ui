import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

export default PrivateRoute

