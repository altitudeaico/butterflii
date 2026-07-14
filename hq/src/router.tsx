import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { SuperAdminHome } from './pages/lenses/SuperAdminHome'
import { OpsAdminHome } from './pages/lenses/OpsAdminHome'
import { ArtistHome } from './pages/lenses/ArtistHome'
import { RoleRoute } from './auth/RoleRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/super"
        element={
          <RoleRoute role="super_admin">
            <SuperAdminHome />
          </RoleRoute>
        }
      />
      <Route
        path="/ops"
        element={
          <RoleRoute role="ops_admin">
            <OpsAdminHome />
          </RoleRoute>
        }
      />
      <Route
        path="/artist"
        element={
          <RoleRoute role="artist">
            <ArtistHome />
          </RoleRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
