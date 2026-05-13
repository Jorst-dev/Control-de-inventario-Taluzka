import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Layout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [alertasPendientes, setAlertasPendientes] = useState(0)

  useEffect(() => {
    api.get('/alertas/pendientes/count')
      .then(res => setAlertasPendientes(res.data.pendientes))
      .catch(() => {})
    // Revisar alertas cada 60 segundos
    const interval = setInterval(() => {
      api.get('/alertas/pendientes/count')
        .then(res => setAlertasPendientes(res.data.pendientes))
        .catch(() => {})
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const links = [
    { to: '/',            label: 'Dashboard' },
    { to: '/productos',   label: 'Productos' },
    { to: '/categorias',  label: 'Categorías' },
    { to: '/movimientos', label: 'Movimientos' },
    { to: '/alertas',     label: `Alertas${alertasPendientes > 0 ? ` (${alertasPendientes})` : ''}` },
    ...(usuario?.rol === 'admin' ? [{ to: '/usuarios', label: 'Usuarios' }] : []),
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <nav style={{ width: 220, background: '#1e3a5f', color: '#fff', padding: '20px 0' }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #2d5a8e' }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Ferretería Taluzka</h2>
          <small style={{ opacity: 0.7 }}>{usuario?.nombre}</small>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {links.map(l => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                style={({ isActive }) => ({
                  display: 'block', padding: '12px 20px',
                  color: isActive ? '#fff' : '#a8c4e0',
                  background: isActive ? '#2d5a8e' : 'transparent',
                  textDecoration: 'none', fontSize: 14,
                })}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div style={{ position: 'absolute', bottom: 20, left: 0, width: 220 }}>
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '12px 20px', background: 'none',
              border: 'none', color: '#a8c4e0', cursor: 'pointer', textAlign: 'left', fontSize: 14 }}
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <main style={{ flex: 1, padding: 30, background: '#f4f6f9', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
