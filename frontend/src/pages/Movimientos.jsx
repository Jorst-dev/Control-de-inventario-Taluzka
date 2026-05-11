import { useEffect, useState } from 'react'
import api from '../services/api'

const FORM_VACIO = { id_producto: '', tipo: 'entrada', cantidad: '', observacion: '' }

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([])
  const [productos,   setProductos]   = useState([])
  const [modal,       setModal]       = useState(false)
  const [form,        setForm]        = useState(FORM_VACIO)
  const [error,       setError]       = useState('')
  const [filtroTipo,  setFiltroTipo]  = useState('')

  const cargar = () => {
    const params = filtroTipo ? `?tipo=${filtroTipo}&limit=100` : '?limit=100'
    api.get(`/movimientos/${params}`).then(r => setMovimientos(r.data))
    api.get('/productos/?activos=true').then(r => setProductos(r.data))
  }
  useEffect(cargar, [filtroTipo])

  const registrar = async (e) => {
    e.preventDefault(); setError('')
    try {
      await api.post('/movimientos/', {
        ...form,
        cantidad: parseInt(form.cantidad),
      })
      setModal(false); setForm(FORM_VACIO); cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar movimiento')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: '#1e3a5f' }}>Movimientos de Inventario</h1>
        <button onClick={() => { setForm(FORM_VACIO); setError(''); setModal(true) }}
          style={{ background: '#1e3a5f', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer' }}>
          + Registrar Movimiento
        </button>
      </div>

      <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
        style={{ padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, marginBottom: 16 }}>
        <option value="">Todos los tipos</option>
        <option value="entrada">Entrada</option>
        <option value="salida">Salida</option>
      </select>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#1e3a5f', color: '#fff' }}>
              {['#','Producto','Tipo','Cantidad','Stock Resultante','Usuario','Observación','Fecha'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m, i) => (
              <tr key={m.id_movimiento} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 14px' }}>{m.id_movimiento}</td>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{m.producto}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: m.tipo === 'entrada' ? '#d4edda' : '#f8d7da',
                    color: m.tipo === 'entrada' ? '#155724' : '#721c24',
                    padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                    {m.tipo === 'entrada' ? '↑ ENTRADA' : '↓ SALIDA'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 700 }}>{m.cantidad}</td>
                <td style={{ padding: '10px 14px' }}>{m.stock_resultado}</td>
                <td style={{ padding: '10px 14px' }}>{m.usuario}</td>
                <td style={{ padding: '10px 14px', color: '#666' }}>{m.observacion || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}>{new Date(m.fecha).toLocaleString('es-PE')}</td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Sin movimientos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, width: 440 }}>
            <h2 style={{ marginTop: 0, color: '#1e3a5f' }}>Registrar Movimiento</h2>
            {error && <div style={{ background: '#fee', padding: 10, borderRadius: 4, marginBottom: 12, color: '#c00' }}>{error}</div>}
            <form onSubmit={registrar}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Producto</label>
                <select required value={form.id_producto}
                  onChange={e => setForm({ ...form, id_producto: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
                  <option value="">Seleccionar producto</option>
                  {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Tipo</label>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
                  <option value="entrada">Entrada (compra al proveedor)</option>
                  <option value="salida">Salida (venta al cliente)</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Cantidad</label>
                <input type="number" min="1" required value={form.cantidad}
                  onChange={e => setForm({ ...form, cantidad: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Observación</label>
                <textarea value={form.observacion} rows={2}
                  onChange={e => setForm({ ...form, observacion: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModal(false)}
                  style={{ padding: '9px 20px', border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit"
                  style={{ padding: '9px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
