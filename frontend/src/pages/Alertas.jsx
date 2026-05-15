import { useEffect, useState } from 'react'
import api from '../services/api'
import './Alertas.css'

const LABEL_ESTADO = {
  pendiente: '🔴 PENDIENTE',
  en_proceso: '🔵 EN PROCESO',
  recibido: '✅ RECIBIDO',
  ignorada: '⬜ IGNORADA',
}

export default function Alertas() {
  const [alertas, setAlertas] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('')

  const cargar = () => {
    let p = ''
    if (filtroEstado === '') {
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
    await api.put(`/alertas/${id}/en_proceso`)
    cargar()
  }

  const marcarRecibido = async (id) => {
    await api.put(`/alertas/${id}/recibido`)
    cargar()
  }

  const ignorar = async (id) => {
    if (!confirm('¿Ignorar esta alerta?')) return
    await api.put(`/alertas/${id}/ignorar`)
    cargar()
  }

  return (
    <div>
      <h1 className="alertas-titulo">Alertas de Stock</h1>

      <select className="alertas-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
        <option value="">Todas</option>
        <option value="pendiente">🔴 Pendientes</option>
        <option value="en_proceso">🔵 En Proceso</option>
        <option value="recibido">✅ Recibidas</option>
        <option value="ignorada">⬜ Ignoradas</option>
      </select>

      <div className="alertas-tabla-container">
        <table className="alertas-tabla">
          <thead>
            <tr className="alertas-thead-tr">
              {['Producto', 'Stock al generar', 'Estado', 'Fecha Generada', 'Fecha Atendida', 'Acciones'].map(h => (
                <th key={h} className="alertas-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alertas.map((a, i) => (
              <tr key={a.id_alerta} className={i % 2 === 0 ? 'alertas-tr-par' : 'alertas-tr-impar'}>
                <td className="alertas-td-producto">{a.producto}</td>
                <td className="alertas-td-stock">{a.stock_al_generar}</td>
                <td className="alertas-td-estado">
                  <span className={`alertas-estado-badge estado-${a.estado}`}>
                    {LABEL_ESTADO[a.estado] || a.estado.toUpperCase()}
                  </span>
                </td>
                <td className="alertas-td-fecha">
                  {new Date(a.fecha_generada).toLocaleString('es-PE')}
                </td>
                <td className="alertas-td-fecha">
                  {a.fecha_atendida ? new Date(a.fecha_atendida).toLocaleString('es-PE') : '—'}
                </td>
                <td className="alertas-td-acciones">
                  <div className="alertas-acciones-container">
                    {a.estado === 'pendiente' && (
                      <button className="alertas-btn alertas-btn-proceso" onClick={() => pasarEnProceso(a.id_alerta)}>
                        🔵 En Proceso
                      </button>
                    )}
                    {a.estado === 'en_proceso' && (
                      <button className="alertas-btn alertas-btn-recibido" onClick={() => marcarRecibido(a.id_alerta)}>
                        ✅ Recibido
                      </button>
                    )}
                    {(a.estado === 'pendiente' || a.estado === 'en_proceso') && (
                      <button className="alertas-btn alertas-btn-ignorar" onClick={() => ignorar(a.id_alerta)}>
                        Ignorar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {alertas.length === 0 && (
              <tr>
                <td colSpan={6} className="alertas-sin-datos">Sin alertas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}