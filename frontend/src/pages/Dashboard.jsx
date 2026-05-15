import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import './Dashboard.css'

function KPI({ titulo, valor, color, icon: Icon, onClick }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (valor === undefined) return
    const target = parseInt(valor) || 0
    if (target === 0) { setDisplayed(0); return }
    let start = 0
    const step = Math.ceil(target / 20)
    const iv = setInterval(() => {
      start += step
      if (start >= target) { setDisplayed(target); clearInterval(iv) }
      else setDisplayed(start)
    }, 40)
    return () => clearInterval(iv)
  }, [valor])

  return (
    <div
      onClick={onClick}
      className={`kpi-card ${onClick ? 'kpi-card-clickable' : ''}`}
      style={{ borderLeftColor: color }}
    >
      <div className="kpi-header">
        <Icon size={20} className="kpi-icon" style={{ color }} />
        <p className="kpi-titulo">{titulo}</p>
      </div>
      <h2 className="kpi-valor" style={{ color }}>{displayed}</h2>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [resumen, setResumen] = useState(null)
  const [alertas, setAlertas] = useState(0)
  const [movimientos, setMov] = useState([])
  const [entradasHoy, setEntradasHoy] = useState(0)
  const [salidasHoy, setSalidasHoy] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [r1, r2, r3] = await Promise.all([
          api.get('/productos/resumen/dashboard'),
          api.get('/alertas/pendientes/count'),
          api.get('/movimientos/?limit=8'),
        ])
        setResumen(r1.data)
        setAlertas(r2.data.pendientes)
        setMov(r3.data)
      } catch (e) {
        console.error('Error cargando dashboard:', e)
      }

      try {
        const r4 = await api.get('/movimientos/resumen/hoy')
        setEntradasHoy(r4.data.entradas_hoy)
        setSalidasHoy(r4.data.salidas_hoy)
      } catch (e) {
        console.error('Error cargando resumen hoy:', e)
      }

      setLoading(false)
    }
    cargar()
    window.addEventListener('focus', cargar)
    return () => window.removeEventListener('focus', cargar)
  }, [])

  if (loading) return (
    <div className="dashboard-loading">
      Cargando dashboard...
    </div>
  )

  return (
    <div>
      <h1 className="dashboard-titulo">Dashboard</h1>

      {/* KPIs */}
      <div className="dashboard-kpis">
        <KPI
          titulo="Total Productos"
          valor={resumen?.total_productos ?? 0}
          color="#1e3a5f"
          icon={Package}
          onClick={() => navigate('/productos')}
        />
        <KPI
          titulo="Stock Bajo / Crítico"
          valor={(resumen?.nivel_bajo ?? 0) + (resumen?.nivel_critico ?? 0)}
          color="#dc3545"
          icon={AlertTriangle}
          onClick={() => navigate('/alertas')}
        />
        <KPI
          titulo="Entradas Hoy"
          valor={entradasHoy}
          color="#28a745"
          icon={ArrowDownToLine}
          onClick={() => navigate('/movimientos')}
        />
        <KPI
          titulo="Salidas Hoy"
          valor={salidasHoy}
          color="#ff6b00"
          icon={ArrowUpFromLine}
          onClick={() => navigate('/movimientos')}
        />
      </div>

      {/* Últimos movimientos */}
      <div className="dashboard-movimientos">
        <h3 className="dashboard-movimientos-titulo">
          <span className="dashboard-movimientos-icono"></span>
          Últimos Movimientos
        </h3>
        <div className="dashboard-tabla-container">
          <table className="dashboard-tabla">
            <thead>
              <tr className="dashboard-thead-tr">
                {['Producto', 'Tipo', 'Cantidad'].map(h => (
                  <th key={h} className="dashboard-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id_movimiento} className="dashboard-tr">
                  <td className="dashboard-td-producto">{m.producto}</td>
                  <td className="dashboard-td-tipo">
                    <span className={`dashboard-tipo-badge ${m.tipo === 'entrada' ? 'dashboard-tipo-entrada' : 'dashboard-tipo-salida'}`}>
                      {m.tipo === 'entrada' ? '↑ ENTRADA' : '↓ SALIDA'}
                    </span>
                  </td>
                  <td className="dashboard-td-cantidad">{m.cantidad}</td>
                </tr>
              ))}
              {movimientos.length === 0 && (
                <tr>
                  <td colSpan={3} className="dashboard-sin-datos">Sin movimientos registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}