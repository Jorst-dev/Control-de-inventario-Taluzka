import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login        from './pages/Login'
import Layout       from './components/Layout'
import Dashboard    from './pages/Dashboard'
import Productos    from './pages/Productos'
import Categorias   from './pages/Categorias'
import Inventario   from './pages/Inventario'
import Movimientos  from './pages/Movimientos'
import Alertas      from './pages/Alertas'
import Usuarios     from './pages/Usuarios'

function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, loading } = useAuth()
  if (loading) return <div style={{ padding: 40 }}>Cargando...</div>
  if (!usuario) return <Navigate to="/login" replace />
  if (soloAdmin && usuario.rol !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <RutaProtegida><Layout /></RutaProtegida>
          }>
            <Route index element={<Dashboard />} />
            <Route path="productos"   element={<Productos />} />
            <Route path="categorias"  element={<Categorias />} />
            <Route path="inventario"  element={<Inventario />} />
            <Route path="movimientos" element={<Movimientos />} />
            <Route path="alertas"     element={<Alertas />} />
            <Route path="usuarios"    element={
              <RutaProtegida soloAdmin><Usuarios /></RutaProtegida>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
