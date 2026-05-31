import { Navigate, Outlet } from 'react-router-dom'
import useStore from '../store/useStore'

export default function ProtectedRoute() {
  const token = useStore((s) => s.token)
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
