import { useEffect, useState } from 'react'
import api from '../services/api'

const COLOR_ESTADO = {
  pendiente:  { bg: '#fff3cd', color: '#856404' },
  en_proceso: { bg: '#cce5ff', color: '#004085' },
  recibido:   { bg: '#d4edda', color: '#155724' },
  ignorada:   { bg: '#e2e3e5', color: '#383d41' },
}

const LABEL_ESTADO = {
  pendiente:  '🔴 PENDIENTE',
  en_proceso: '🔵 EN PROCESO',
  recibido:   '✅ RECIBIDO',
  ignorada:   '⬜ IGNORADA',
}

export default function Alertas() {
  const [alertas,      setAlertas]      = useState([])
  const [filtroEstado, setFiltroEstado] = useState('')

  const cargar = () => {
    let p = ''
    if (filtroEstado === '') {
      // "Todas" solo muestra pendiente y en_proceso
      p = '?estado=pendiente'
      api.get(`/alertas/?estado=pendiente`).then(r1 =>
        api.get(`/alertas/?estado=en_proceso`).then(r2 =>
          setAlertas([...r1.data, ...r2.data])
        )
      )
      return
    }
    p = `?estado=${filtroEstado}`
    api.get(`/alertas/${p}`).then(r => setAlertas(r.data))
  }
  useEffect(() => {
  cargar()
  window.addEventListener('focus', cargar)
  return () => window.removeEventListener('focus', cargar)
}, [filtroEstado])

  const pasarEnProceso = async (id) => {
    await api.put(`/alertas/${id}/en_proceso`); cargar()
  }
  const marcarRecibido = async (id) => {
    await api.put(`/alertas/${id}/recibido`); cargar()
  }
  const ignorar = async (id) => {
    if (!confirm('¿Ignorar esta alerta?')) return
    await api.put(`/alertas/${id}/ignorar`); cargar()
  }

  return (
    <div>
      <h1 style={{ marginTop: 0, color: '#1e3a5f' }}>🔔 Alertas de Stock</h1>

      <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
        style={{ padding: '10px 14px', border: '1px solid #ddd',
          borderRadius: 4, fontSize: 14, marginBottom: 16 }}>
        <option value="">Todas</option>
        <option value="pendiente">🔴 Pendientes</option>
        <option value="en_proceso">🔵 En Proceso</option>
        <option value="recibido">✅ Recibidas</option>
        <option value="ignorada">⬜ Ignoradas</option>
      </select>

      <div style={{ background: '#fff', borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1e3a5f', color: '#fff' }}>
              {['Producto','Stock al generar','Estado','Fecha Generada','Fecha Atendida','Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alertas.map((a, i) => {
              const est = COLOR_ESTADO[a.estado] || { bg: '#eee', color: '#333' }
              return (
                <tr key={a.id_alerta}
                  style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{a.producto}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 700,
                    color: '#dc3545', fontSize: 16 }}>{a.stock_al_generar}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: est.bg, color: est.color,
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                      {LABEL_ESTADO[a.estado] || a.estado.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12 }}>
                    {new Date(a.fecha_generada).toLocaleString('es-PE')}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12 }}>
                    {a.fecha_atendida
                      ? new Date(a.fecha_atendida).toLocaleString('es-PE')
                      : '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {a.estado === 'pendiente' && (
                        <button onClick={() => pasarEnProceso(a.id_alerta)}
                          style={{ background: '#004085', color: '#fff', border: 'none',
                            padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                          🔵 En Proceso
                        </button>
                      )}
                      {a.estado === 'en_proceso' && (
                        <button onClick={() => marcarRecibido(a.id_alerta)}
                          style={{ background: '#28a745', color: '#fff', border: 'none',
                            padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                          ✅ Recibido
                        </button>
                      )}
                      {(a.estado === 'pendiente' || a.estado === 'en_proceso') && (
                        <button onClick={() => ignorar(a.id_alerta)}
                          style={{ background: '#6c757d', color: '#fff', border: 'none',
                            padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                          Ignorar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {alertas.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#999' }}>
                Sin alertas
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}