import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Alertas() {
  const [alertas,      setAlertas]     = useState([])
  const [filtroEstado, setFiltroEstado]= useState('pendiente')

  const cargar = () => {
    const params = filtroEstado ? `?estado=${filtroEstado}` : ''
    api.get(`/alertas/${params}`).then(r => setAlertas(r.data))
  }
  useEffect(cargar, [filtroEstado])

  const atender = async (id) => {
    await api.put(`/alertas/${id}/atender`); cargar()
  }
  const ignorar = async (id) => {
    if (!confirm('¿Ignorar esta alerta?')) return
    await api.put(`/alertas/${id}/ignorar`); cargar()
  }

  const colorEstado = {
    pendiente: { bg: '#fff3cd', color: '#856404' },
    atendida:  { bg: '#d4edda', color: '#155724' },
    ignorada:  { bg: '#e2e3e5', color: '#383d41' },
  }

  return (
    <div>
      <h1 style={{ marginTop: 0, color: '#1e3a5f' }}>Alertas de Stock</h1>

      <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
        style={{ padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, marginBottom: 16 }}>
        <option value="">Todas</option>
        <option value="pendiente">Pendientes</option>
        <option value="atendida">Atendidas</option>
        <option value="ignorada">Ignoradas</option>
      </select>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#1e3a5f', color: '#fff' }}>
              {['Producto','Stock al generar','Estado','Fecha Generada','Fecha Atendida','Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alertas.map((a, i) => {
              const est = colorEstado[a.estado] || { bg: '#eee', color: '#333' }
              return (
                <tr key={a.id_alerta} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{a.producto}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#dc3545' }}>{a.stock_al_generar}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: est.bg, color: est.color,
                      padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                      {a.estado.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12 }}>{new Date(a.fecha_generada).toLocaleString('es-PE')}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12 }}>
                    {a.fecha_atendida ? new Date(a.fecha_atendida).toLocaleString('es-PE') : '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {a.estado === 'pendiente' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => atender(a.id_alerta)}
                          style={{ background: '#28a745', color: '#fff', border: 'none',
                            padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                          Atendida
                        </button>
                        <button onClick={() => ignorar(a.id_alerta)}
                          style={{ background: '#6c757d', color: '#fff', border: 'none',
                            padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                          Ignorar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {alertas.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Sin alertas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
