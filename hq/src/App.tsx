import { AppRoutes } from './router'
import { useAuth } from './auth/useAuth'
import { SetNewPasswordPage } from './pages/SetNewPasswordPage'

export default function App() {
  const { passwordRecovery } = useAuth()
  return passwordRecovery ? <SetNewPasswordPage /> : <AppRoutes />
}
