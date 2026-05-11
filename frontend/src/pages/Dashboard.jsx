import { useEffect, useState } from 'react'
import api from '../services/api'

function Tarjeta({ titulo, valor, color = '#1e3a5f' }) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}` }}>
      <p style={{ margin: 0, color: '#888', fontSize: 13 }}>{titulo}</p>
      <h2 style={{ margin: '6px 0 0', fontSize: 32, color }}>{valor}</h2>
    </div>
  )
}

export default function Dashboard() {
  const [resumen, setResumen]     = useState(null)
  const [alertas, setAlertas]     = useState(0)
  const [movimientos, setMov]     = useState([])

  useEffect(() => {
    api.get('/inventario/resumen').then(r => setResumen(r.data))
    api.get('/alertas/pendientes/count').then(r => setAlertas(r.data.pendientes))
    api.get('/movimientos/?limit=8').then(r => setMov(r.data))
  }, [])

  return (
    <div>
      <h1 style={{ marginTop: 0, color: '#1e3a5f' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 30 }}>
        <Tarjeta titulo="Total Productos"  valor={resumen?.total_productos ?? '—'} color="#1e3a5f" />
        <Tarjeta titulo="Nivel Alto"       valor={resumen?.nivel_alto ?? '—'}      color="#28a745" />
        <Tarjeta titulo="Nivel Medio"      valor={resumen?.nivel_medio ?? '—'}     color="#ffc107" />
        <Tarjeta titulo="Nivel Bajo"       valor={resumen?.nivel_bajo ?? '—'}      color="#fd7e14" />
        <Tarjeta titulo="Nivel Crítico"    valor={resumen?.nivel_critico ?? '—'}   color="#dc3545" />
        <Tarjeta titulo="Alertas Pendientes" valor={alertas}                       color="#dc3545" />
      </div>

      <div style={{ background: '#fff', borderRadius: 8, padding: 24,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0, color: '#1e3a5f' }}>Últimos Movimientos</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f4f6f9' }}>
              {['Producto','Tipo','Cantidad','Stock resultante','Usuario','Fecha'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#555' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movimientos.map(m => (
              <tr key={m.id_movimiento} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 12px' }}>{m.producto}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ background: m.tipo === 'entrada' ? '#d4edda' : '#f8d7da',
                    color: m.tipo === 'entrada' ? '#155724' : '#721c24',
                    padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>
                    {m.tipo}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>{m.cantidad}</td>
                <td style={{ padding: '10px 12px' }}>{m.stock_resultado}</td>
                <td style={{ padding: '10px 12px' }}>{m.usuario}</td>
                <td style={{ padding: '10px 12px' }}>{new Date(m.fecha).toLocaleString('es-PE')}</td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Sin movimientos registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
