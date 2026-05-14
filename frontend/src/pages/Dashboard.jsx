import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function KPI({ titulo, valor, color, onClick }) {
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
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 10, padding: '20px 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderLeft: `5px solid ${color}`,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform .15s, box-shadow .15s',
      flex: 1,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <p style={{ margin: 0, color: '#888', fontSize: 12, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: 1 }}>{titulo}</p>
      <h2 style={{ margin: '8px 0 0', fontSize: 36, color, fontWeight: 700 }}>{displayed}</h2>
    </div>
  )
}

export default function Dashboard() {
  const navigate  = useNavigate()
  const [resumen,     setResumen]     = useState(null)
  const [alertas,     setAlertas]     = useState(0)
  const [movimientos, setMov]         = useState([])
  const [entradasHoy, setEntradasHoy] = useState(0)
  const [salidasHoy,  setSalidasHoy]  = useState(0)
  const [loading,     setLoading]     = useState(true)

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
    <div style={{ display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: 300, color: '#888', fontSize: 16 }}>
      Cargando dashboard...
    </div>
  )

  return (
    <div>
      <h1 style={{ marginTop: 0, color: '#1e3a5f', fontSize: 22, fontWeight: 700 }}>
        Dashboard
      </h1>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <KPI
          titulo="Total Productos"
          valor={resumen?.total_productos ?? 0}
          color="#1e3a5f"
          onClick={() => navigate('/productos')}
        />
        <KPI
          titulo="Stock Bajo / Crítico"
          valor={(resumen?.nivel_bajo ?? 0) + (resumen?.nivel_critico ?? 0)}
          color="#dc3545"
          onClick={() => navigate('/alertas')}
        />
        <KPI
          titulo="Entradas Hoy"
          valor={entradasHoy}
          color="#28a745"
          onClick={() => navigate('/movimientos')}
        />
        <KPI
          titulo="Salidas Hoy"
          valor={salidasHoy}
          color="#fd7e14"
          onClick={() => navigate('/movimientos')}
        />
      </div>

      {/* Últimos movimientos */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0, color: '#1e3a5f', fontSize: 15 }}>
          🔄 Últimos Movimientos
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f4f6f9' }}>
              {['Producto', 'Tipo', 'Cantidad'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left',
                  color: '#555', fontWeight: 600, borderBottom: '2px solid #eee' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m, i) => (
              <tr key={m.id_movimiento}
                style={{ borderBottom: '1px solid #f0f0f0' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{m.producto}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    background: m.tipo === 'entrada' ? '#d4edda' : '#f8d7da',
                    color: m.tipo === 'entrada' ? '#155724' : '#721c24',
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700
                  }}>
                    {m.tipo === 'entrada' ? '↑ ENTRADA' : '↓ SALIDA'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 700 }}>{m.cantidad}</td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr><td colSpan={3} style={{ padding: 24, textAlign: 'center', color: '#bbb' }}>
                Sin movimientos registrados
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}