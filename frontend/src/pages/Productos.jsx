import { useEffect, useState } from 'react'
import api from '../services/api'

const FORM_VACIO = {
  nombre: '', id_categoria: '', descripcion: '',
  precio_compra: '', precio: '', tipo_control: 'unidad',
  stock_inicial: 0, stock_minimo: 5,
}

export default function Productos() {
  const [productos,   setProductos]  = useState([])
  const [categorias,  setCategorias] = useState([])
  const [modal,       setModal]      = useState(false)
  const [form,        setForm]       = useState(FORM_VACIO)
  const [editId,      setEditId]     = useState(null)
  const [error,       setError]      = useState('')
  const [buscar,      setBuscar]     = useState('')

  const cargar = () => {
    api.get('/productos/').then(r => setProductos(r.data))
    api.get('/categorias/?activas=true').then(r => setCategorias(r.data))
  }
  useEffect(cargar, [])

  const abrirCrear = () => { setForm(FORM_VACIO); setEditId(null); setError(''); setModal(true) }
  const abrirEditar = (p) => {
    setForm({
      nombre: p.nombre, id_categoria: p.id_categoria,
      descripcion: p.descripcion || '',
      precio_compra: p.precio_compra, precio: p.precio,
      tipo_control: p.tipo_control,
      stock_inicial: 0, stock_minimo: 5,
    })
    setEditId(p.id_producto); setError(''); setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault(); setError('')
    try {
      if (editId) {
        await api.put(`/productos/${editId}`, form)
      } else {
        await api.post('/productos/', form)
      }
      setModal(false); cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Desactivar este producto?')) return
    await api.delete(`/productos/${id}`)
    cargar()
  }

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(buscar.toLowerCase())
  )

  const ganancia = (p) => (parseFloat(p.precio) - parseFloat(p.precio_compra)).toFixed(2)
  const margen   = (p) => {
    const pc = parseFloat(p.precio_compra)
    if (!pc) return '0%'
    return ((parseFloat(p.precio) - pc) / pc * 100).toFixed(1) + '%'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: '#1e3a5f' }}>Productos</h1>
        <button onClick={abrirCrear}
          style={{ background: '#1e3a5f', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: 4, cursor: 'pointer' }}>
          + Nuevo Producto
        </button>
      </div>

      <input
        placeholder="Buscar producto..."
        value={buscar} onChange={e => setBuscar(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd',
          borderRadius: 4, marginBottom: 16, fontSize: 14, boxSizing: 'border-box' }}
      />

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#1e3a5f', color: '#fff' }}>
              {['Nombre','Categoría','P. Compra','P. Venta','Ganancia','Margen','Tipo','Estado','Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p, i) => (
              <tr key={p.id_producto} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.nombre}</td>
                <td style={{ padding: '10px 14px' }}>{p.categoria}</td>
                <td style={{ padding: '10px 14px' }}>S/. {parseFloat(p.precio_compra).toFixed(2)}</td>
                <td style={{ padding: '10px 14px' }}>S/. {parseFloat(p.precio).toFixed(2)}</td>
                <td style={{ padding: '10px 14px', color: '#28a745' }}>S/. {ganancia(p)}</td>
                <td style={{ padding: '10px 14px' }}>{margen(p)}</td>
                <td style={{ padding: '10px 14px' }}>{p.tipo_control}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: p.estado ? '#d4edda' : '#f8d7da',
                    color: p.estado ? '#155724' : '#721c24',
                    padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>
                    {p.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 6 }}>
                  <button onClick={() => abrirEditar(p)}
                    style={{ background: '#1e3a5f', color: '#fff', border: 'none',
                      padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    Editar
                  </button>
                  <button onClick={() => eliminar(p.id_producto)}
                    style={{ background: '#dc3545', color: '#fff', border: 'none',
                      padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    Desactivar
                  </button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Sin productos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, width: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, color: '#1e3a5f' }}>{editId ? 'Editar' : 'Nuevo'} Producto</h2>
            {error && <div style={{ background: '#fee', padding: 10, borderRadius: 4, marginBottom: 12, color: '#c00' }}>{error}</div>}
            <form onSubmit={guardar}>
              {[
                { label: 'Nombre', key: 'nombre', type: 'text', required: true },
                { label: 'Descripción', key: 'descripcion', type: 'text' },
                { label: 'Precio de Compra (S/.)', key: 'precio_compra', type: 'number', step: '0.01', required: true },
                { label: 'Precio de Venta (S/.)', key: 'precio', type: 'number', step: '0.01', required: true },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>{f.label}</label>
                  <input type={f.type} step={f.step} required={f.required}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd',
                      borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Categoría</label>
                <select required value={form.id_categoria}
                  onChange={e => setForm({ ...form, id_categoria: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Tipo de Control</label>
                <select value={form.tipo_control}
                  onChange={e => setForm({ ...form, tipo_control: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
                  <option value="unidad">Unidad</option>
                  <option value="caja">Caja</option>
                </select>
              </div>

              {!editId && (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Stock Inicial</label>
                    <input type="number" min="0" value={form.stock_inicial}
                      onChange={e => setForm({ ...form, stock_inicial: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Stock Mínimo</label>
                    <input type="number" min="0" value={form.stock_minimo}
                      onChange={e => setForm({ ...form, stock_minimo: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" onClick={() => setModal(false)}
                  style={{ padding: '9px 20px', border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit"
                  style={{ padding: '9px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                  {editId ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
