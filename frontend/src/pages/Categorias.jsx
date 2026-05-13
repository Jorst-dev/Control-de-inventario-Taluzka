import { useEffect, useState } from 'react'
import api from '../services/api'
import { Pencil, ToggleLeft, ToggleRight } from "lucide-react"

const FORM_VACIO = { nombre: '', descripcion: '' }

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [modal,      setModal]      = useState(false)
  const [form,       setForm]       = useState(FORM_VACIO)
  const [editId,     setEditId]     = useState(null)
  const [error,      setError]      = useState('')

   useEffect(() => {
    cargar()
  }, [])

  const cargar = () => api.get('/categorias/').then(r => setCategorias(r.data))

  const abrirCrear = () => { setForm(FORM_VACIO); setEditId(null); setError(''); setModal(true) }
  const abrirEditar = (c) => { setForm({ nombre: c.nombre, descripcion: c.descripcion || '' }); setEditId(c.id_categoria); setError(''); setModal(true) }

  const guardar = async (e) => {
    e.preventDefault(); setError('')
    try {
      if (editId) await api.put(`/categorias/${editId}`, form)
      else        await api.post('/categorias/', form)
      setModal(false); cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    const mensaje = nuevoEstado ? '¿Activar esta categoría?' : '¿Desactivar esta categoría?'
    if (!confirm(mensaje)) return
    await api.put(`/categorias/${id}`, { estado: nuevoEstado })
    cargar()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: '#1e3a5f' }}>Categorías</h1>
        <button onClick={abrirCrear}
          style={{ background: '#1e3a5f', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer' }}>
          + Nueva Categoría
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#1e3a5f', color: '#fff' }}>
              {['#','Nombre','Descripción','Estado','Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categorias.map((c, i) => (
              <tr key={c.id_categoria} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 14px' }}>{c.id_categoria}</td>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{c.nombre}</td>
                <td style={{ padding: '10px 14px' }}>{c.descripcion}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: c.estado ? '#d4edda' : '#f8d7da',
                    color: c.estado ? '#155724' : '#721c24',
                    padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>
                    {c.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 6 }}>
                  <button onClick={() => abrirEditar(c)}
                    style={{ background: '#1e3a5f', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 4, cursor: 'pointer' }}title="Editar"
                      >
                    <Pencil size={15} />
                  </button>

                  {c.estado === true || c.estado === 1 ? (
                    <button onClick={() => cambiarEstado(c.id_categoria, false)}
                      style={{ background:'#d4071b', color: '#fff', border:'none', 
                        padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize: 12}}
                      title="Desactivar"
                        >
                          <ToggleRight size={15} />
                    </button>
                  ) : (
                    <button onClick={() => cambiarEstado(c.id_categoria, true)}
                      style={{ background:'#28a745', color: '#fff', border:'none', padding:'6px 12px', borderRadius:4, cursor:'pointer',fontSize: 12 }}
                      title="Activar"
                        >
                          <ToggleLeft size={15} />
                    </button>

                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, width: 420 }}>
            <h2 style={{ marginTop: 0, color: '#1e3a5f' }}>{editId ? 'Editar' : 'Nueva'} Categoría</h2>
            {error && <div style={{ background: '#fee', padding: 10, borderRadius: 4, marginBottom: 12, color: '#c00' }}>{error}</div>}
            <form onSubmit={guardar}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Nombre</label>
                <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  rows={3} style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModal(false)}
                  style={{ padding: '9px 20px', border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit"
                  style={{ padding: '9px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                  {editId ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
