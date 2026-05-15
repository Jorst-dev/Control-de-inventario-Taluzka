import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import './Movimientos.css'

const FORM_VACIO = { id_producto: '', tipo: 'entrada', cantidad: '', observacion: '' }

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([])
  const [productos, setProductos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [error, setError] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  const [searchParams] = useSearchParams()

  const cargar = () => {
    const params = filtroTipo ? `?tipo=${filtroTipo}&limit=100` : '?limit=100'
    api.get(`/movimientos/${params}`).then(r => setMovimientos(r.data))
    api.get('/productos/?activos=true').then(r => {
      const lista = r.data.filter(p => p.tipo_control !== 'nivel')
      setProductos(lista)
    })
  }
  useEffect(() => {
    cargar()
    window.addEventListener('focus', cargar)
    return () => window.removeEventListener('focus', cargar)
  }, [filtroTipo])

  useEffect(() => {
    const idProducto = searchParams.get('id_producto')
    if (idProducto) {
      setForm({ id_producto: idProducto, tipo: 'salida', cantidad: '', observacion: '' })
      setModal(true)
    }
  }, [searchParams])

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
      <div className="movimientos-header">
        <h1 className="movimientos-titulo">Movimientos de Inventario</h1>
        <button onClick={() => { setForm(FORM_VACIO); setError(''); setModal(true) }} className="movimientos-btn-nuevo">
          + Registrar Movimiento
        </button>
      </div>

      <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="movimientos-select">
        <option value="">Todos los tipos</option>
        <option value="entrada">Entrada</option>
        <option value="salida">Salida</option>
      </select>

      <div className="movimientos-tabla-container">
        <table className="movimientos-tabla">
          <thead>
            <tr className="movimientos-thead-tr">
              {['#','Producto','Tipo','Cantidad','Stock Resultante','Usuario','Observación','Fecha'].map(h => (
                <th key={h} className="movimientos-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m, i) => (
              <tr key={m.id_movimiento} className={i % 2 === 0 ? 'movimientos-tr-par' : 'movimientos-tr-impar'}>
                <td className="movimientos-td-id">{m.id_movimiento}</td>
                <td className="movimientos-td-producto">{m.producto}</td>
                <td className="movimientos-td-tipo">
                  <span className={`movimientos-tipo-badge ${m.tipo === 'entrada' ? 'movimientos-tipo-entrada' : 'movimientos-tipo-salida'}`}>
                    {m.tipo === 'entrada' ? '↑ ENTRADA' : '↓ SALIDA'}
                  </span>
                </td>
                <td className="movimientos-td-cantidad">{m.cantidad}</td>
                <td className="movimientos-td-stock">{m.stock_resultado}</td>
                <td className="movimientos-td-usuario">{m.usuario}</td>
                <td className="movimientos-td-observacion">{m.observacion || '—'}</td>
                <td className="movimientos-td-fecha">{new Date(m.fecha).toLocaleString('es-PE')}</td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr><td colSpan={8} className="movimientos-sin-datos">Sin movimientos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="movimientos-modal-overlay">
          <div className="movimientos-modal">
            <h2 className="movimientos-modal-titulo">Registrar Movimiento</h2>
            {error && <div className="movimientos-modal-error">{error}</div>}
            <form onSubmit={registrar}>
              <div className="movimientos-form-group">
                <label className="movimientos-form-label">Producto</label>
                <select required value={form.id_producto}
                  onChange={e => setForm({ ...form, id_producto: e.target.value })}
                  className="movimientos-form-select">
                  <option value="">Seleccionar producto</option>
                  {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}
                </select>
              </div>
              <div className="movimientos-form-group">
                <label className="movimientos-form-label">Tipo</label>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                  className="movimientos-form-select">
                  <option value="entrada">Entrada (compra al proveedor)</option>
                  <option value="salida">Salida (venta al cliente)</option>
                </select>
              </div>
              <div className="movimientos-form-group">
                <label className="movimientos-form-label">Cantidad</label>
                <input type="number" min="1" required value={form.cantidad}
                  onChange={e => setForm({ ...form, cantidad: e.target.value })}
                  className="movimientos-form-input" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="movimientos-form-label">Observación</label>
                <textarea value={form.observacion} rows={2}
                  onChange={e => setForm({ ...form, observacion: e.target.value })}
                  className="movimientos-form-textarea" />
              </div>
              <div className="movimientos-modal-botones">
                <button type="button" onClick={() => setModal(false)} className="movimientos-btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="movimientos-btn-registrar">
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