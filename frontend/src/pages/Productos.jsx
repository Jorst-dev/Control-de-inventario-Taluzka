import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const FORM_VACIO = {
  nombre: '', id_categoria: '', descripcion: '',
  precio_compra: '', precio: '', tipo_control: 'unidad',
  stock_inicial: 0, stock_minimo: 5,
  nivel_estado: 'LLENO',
}

export default function Productos() {
  const navigate = useNavigate()
  const [productos,   setProductos]  = useState([])

  const [categorias,  setCategorias] = useState([])
  const [modal,       setModal]      = useState(false)
  const [form,        setForm]       = useState(FORM_VACIO)
  const [editId,      setEditId]     = useState(null)
  const [error,       setError]      = useState('')
  const [buscar,      setBuscar]     = useState('')
  
  const [filtroCat,  setFiltroCat]  = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

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
      nivel_estado: p.nivel_estado || 'LLENO',
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

  const cambiarEstado = async (id, nuevoEstado) => {
  const mensaje = nuevoEstado ? '¿Activar este producto?' : '¿Desactivar este producto?'
  if (!confirm(mensaje)) return
  await api.put(`/productos/${id}`, { estado: nuevoEstado })
  cargar()
}

  const filtrados = productos.filter(p => {
  const matchNombre = p.nombre.toLowerCase().includes(buscar.toLowerCase())
  const matchCat    = filtroCat  ? String(p.id_categoria) === filtroCat : true
  const matchTipo   = filtroTipo ? p.tipo_control === filtroTipo : true
  return matchNombre && matchCat && matchTipo
})

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

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
      <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)}
        style={{ flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
        <option value="">Todas las categorías</option>
        {categorias.map(c => (
          <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
        ))}
      </select>

      <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
        style={{ flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
        <option value="">Todos los tipos</option>
        <option value="unidad">Unidades</option>
        <option value="caja">Cajones</option>
        <option value="nivel">Por Nivel</option>
      </select>
    </div>


      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#1e3a5f', color: '#fff' }}>
              {['Nombre','Categoría','P. Compra','P. Venta','Ganancia','Margen','Stock Actual','Acciones'].map(h => (
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
                <td style={{
                  padding: '10px 14px',
                  fontWeight: 700,
                  color: p.tipo_control === 'nivel' ? '#333' :
                        p.stock_actual <= 0 ? '#dc3545' :
                        p.stock_actual <= p.stock_minimo ? '#fd7e14' : '#28a745'
                }}>
                  {p.tipo_control === 'nivel'
                    ? <span style={{
                        background: p.nivel_estado === 'LLENO' ? '#d4edda' :
                                    p.nivel_estado === 'MEDIO' ? '#fff3cd' : '#f8d7da',
                        color: p.nivel_estado === 'LLENO' ? '#155724' :
                              p.nivel_estado === 'MEDIO' ? '#856404' : '#721c24',
                        padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600
                      }}>
                        {p.nivel_estado === 'LLENO' ? '🟢 LLENO' :
                        p.nivel_estado === 'MEDIO' ? '🟡 MEDIO' : '🔴 BAJO'}
                      </span>
                    : p.stock_actual
                  }
                </td>

                

                <td style={{ padding: '10px 14px', display: 'flex', gap: 6 }}>
                  <button onClick={() => abrirEditar(p)}
                    style={{ background: '#1e3a5f', color: '#fff', border: 'none',
                      padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    Editar
                  </button>
                  {p.tipo_control !== 'nivel' && (
                    <button
                      onClick={() => navigate(`/movimientos?id_producto=${p.id_producto}&nombre=${encodeURIComponent(p.nombre)}`)}
                      style={{ background: '#28a745', color: '#fff', border: 'none',
                        padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      + Mov.
                    </button>
                  )}
                  {p.estado === true || p.estado === 1 ? (
                    <button onClick={() => cambiarEstado(p.id_producto, false)}
                      style={{ background: '#dc3545', color: '#fff', border: 'none',
                        padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      Desactivar
                    </button>
                  ) : (
                    <button onClick={() => cambiarEstado(p.id_producto, true)}
                      style={{ background: '#fd7e14', color: '#fff', border: 'none',
                        padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      Activar
                    </button>
                  )}
                </td>

              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Sin productos</td></tr>
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
                   <option value="nivel">Por Nivel (Verde / Amarillo / Rojo)</option>
                </select>
              </div>

              {/* Si tipo nivel: mostrar selector de color, en crear Y editar */}
{form.tipo_control === 'nivel' && (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
      Estado de Nivel
    </label>
    <div style={{ display: 'flex', gap: 10 }}>
      {[
        { valor: 'LLENO', label: 'LLENO',  bg: '#d4edda', color: '#155724', borde: '#28a745' },
        { valor: 'MEDIO', label: 'MEDIO',  bg: '#fff3cd', color: '#856404', borde: '#e6a817' },
        { valor: 'BAJO',  label: 'BAJO',   bg: '#f8d7da', color: '#721c24', borde: '#dc3545' },
      ].map(n => (
        <button
          key={n.valor}
          type="button"
          onClick={() => setForm({ ...form, nivel_estado: n.valor })}
          style={{
            flex: 1,
            padding: '12px 6px',
            border: `2px solid ${form.nivel_estado === n.valor ? n.borde : '#ddd'}`,
            background: form.nivel_estado === n.valor ? n.bg : '#fff',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: form.nivel_estado === n.valor ? 700 : 400,
            fontSize: 13,
            color: form.nivel_estado === n.valor ? n.color : '#aaa',
            transition: 'all .15s',
          }}
        >
          {n.valor === 'LLENO' ? '🟢' : n.valor === 'MEDIO' ? '🟡' : '🔴'} {n.label}
        </button>
      ))}
    </div>
  </div>
)}

{/* Si tipo unidad o caja: mostrar stock (solo al crear) */}
{!editId && form.tipo_control !== 'nivel' && (
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
