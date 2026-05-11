import { useEffect, useState } from 'react'
import api from '../services/api'

const NIVEL_COLOR = {
  alto:    { bg: '#d4edda', color: '#155724' },
  medio:   { bg: '#fff3cd', color: '#856404' },
  bajo:    { bg: '#ffe5d0', color: '#7a3800' },
  critico: { bg: '#f8d7da', color: '#721c24' },
}

export default function Inventario() {
  const [inventario, setInventario] = useState([])
  const [modal,      setModal]      = useState(false)
  const [seleccion,  setSeleccion]  = useState(null)
  const [stockMin,   setStockMin]   = useState('')
  const [buscar,     setBuscar]     = useState('')
  const [filtroNivel,setFiltroNivel]= useState('')

  useEffect(() => {
    cargar()
  }, [])


  const cargar = () => api.get('/inventario/').then(r => setInventario(r.data))

  const abrirEditar = (item) => {
    setSeleccion(item); setStockMin(item.stock_minimo); setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    await api.put(`/inventario/${seleccion.id_control}`, { stock_minimo: parseInt(stockMin) })
    setModal(false); cargar()
  }

  const filtrados = inventario.filter(i => {
    const matchNombre = i.producto.toLowerCase().includes(buscar.toLowerCase())
    const matchNivel  = filtroNivel ? i.nivel_actual === filtroNivel : true
    return matchNombre && matchNivel
  })

  return (
    <div>
      <h1 style={{ marginTop: 0, color: '#1e3a5f' }}>Control de Inventario</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input placeholder="Buscar producto..."
          value={buscar} onChange={e => setBuscar(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}
        />
        <select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
          <option value="">Todos los niveles</option>
          <option value="alto">Alto</option>
          <option value="medio">Medio</option>
          <option value="bajo">Bajo</option>
          <option value="critico">Crítico</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#1e3a5f', color: '#fff' }}>
              {['Producto','Categoría','Stock Actual','Stock Mínimo','Nivel','P. Compra','P. Venta','Última Actualización','Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((item, i) => {
              const nivel = NIVEL_COLOR[item.nivel_actual] || { bg: '#eee', color: '#333' }
              return (
                <tr key={item.id_control} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{item.producto}</td>
                  <td style={{ padding: '10px 14px' }}>{item.categoria}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: 16 }}>{item.stock_actual}</td>
                  <td style={{ padding: '10px 14px' }}>{item.stock_minimo}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: nivel.bg, color: nivel.color,
                      padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                      {item.nivel_actual?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>S/. {parseFloat(item.precio_compra).toFixed(2)}</td>
                  <td style={{ padding: '10px 14px' }}>S/. {parseFloat(item.precio_venta).toFixed(2)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12 }}>
                    {new Date(item.fecha_actualizacion).toLocaleString('es-PE')}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button onClick={() => abrirEditar(item)}
                      style={{ background: '#1e3a5f', color: '#fff', border: 'none',
                        padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      Stock mín.
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && seleccion && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, width: 360 }}>
            <h2 style={{ marginTop: 0, color: '#1e3a5f' }}>Ajustar Stock Mínimo</h2>
            <p style={{ color: '#555' }}>Producto: <strong>{seleccion.producto}</strong></p>
            <form onSubmit={guardar}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Stock Mínimo</label>
                <input type="number" min="0" required value={stockMin}
                  onChange={e => setStockMin(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModal(false)}
                  style={{ padding: '9px 20px', border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit"
                  style={{ padding: '9px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
