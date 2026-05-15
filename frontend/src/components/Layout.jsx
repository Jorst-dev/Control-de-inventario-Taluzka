import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState, useRef } from 'react'
import api from '../services/api'
import {
  LayoutDashboard, Package, Tags, ArrowLeftRight, Bell, Users,
  LogOut, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react'
import './Layout.css'

export default function Layout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [alertasPendientes, setAlertasPendientes] = useState(0)
  const [collapsed, setCollapsed] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarRef = useRef(null)

  useEffect(() => {
    const cargarAlertas = () => {
      api.get('/alertas/pendientes/count')
        .then(res => setAlertasPendientes(res.data.pendientes))
        .catch(() => {})
    }
    
    cargarAlertas()
    
    // Actualizar cada 60 segundos
    const interval = setInterval(cargarAlertas, 1000)
    
    // Actualizar al volver a la pestaña
    window.addEventListener('focus', cargarAlertas)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', cargarAlertas)
    }
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const toggleSidebar = () => setCollapsed(prev => !prev)
  const toggleMobile = () => setMobileOpen(prev => !prev)

  // Abrir al pasar el mouse, cerrar al quitarlo
  const handleMouseEnter = () => { if (collapsed) setCollapsed(false) }
  const handleMouseLeave = () => { if (!mobileOpen) setCollapsed(true) }

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/productos', label: 'Productos', icon: Package },
    { to: '/categorias', label: 'Categorías', icon: Tags },
    { to: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
    { to: '/alertas', label: `Alertas${alertasPendientes > 0 ? ` ${alertasPendientes}` : ''}`, icon: Bell },

    ...(usuario?.rol === 'admin' ? [{ to: '/usuarios', label: 'Usuarios', icon: Users }] : []),
  ]

  return (
    <div className="layout-container">
      {/* Overlay móvil */}
      <div className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`} onClick={toggleMobile} />

      {/* Botón hamburguesa móvil */}
      <button className="mobile-hamburger" onClick={toggleMobile}>
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <nav
        ref={sidebarRef}
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Botón colapsar */}
        <button className="sidebar-toggle" onClick={toggleSidebar} title={collapsed ? 'Expandir menú' : 'Colapsar menú'}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className="sidebar-header">
          <h2 className="sidebar-titulo">Ferretería Taluzka</h2>
          <small className="sidebar-usuario">{usuario?.nombre}</small>
        </div>

        <ul className="sidebar-menu">
          {links.map(l => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <l.icon size={18} className="icon" />
                <span className="label">{l.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-logout">
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={18} className="icon" />
            <span className="label">Cerrar sesión</span>
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}