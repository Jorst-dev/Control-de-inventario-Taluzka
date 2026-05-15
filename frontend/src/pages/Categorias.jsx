import { useEffect, useState } from 'react'
import api from '../services/api'
import { Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import './Categorias.css'

const FORM_VACIO = { nombre: '', descripcion: '' }

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    cargar()
    window.addEventListener('focus', cargar)
    return () => window.removeEventListener('focus', cargar)
  }, [])

  const cargar = () => api.get('/categorias/').then(r => setCategorias(r.data))

  const abrirCrear = () => { setForm(FORM_VACIO); setEditId(null); setError(''); setModal(true) }
  const abrirEditar = (c) => { setForm({ nombre: c.nombre, descripcion: c.descripcion || '' }); setEditId(c.id_categoria); setError(''); setModal(true) }

  const guardar = async (e) => {
    e.preventDefault(); setError('')
    try {
      if (editId) await api.put(`/categorias/${editId}`, form)
      else await api.post('/categorias/', form)
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
      <div className="categorias-header">
        <h1 className="categorias-titulo">Categorías</h1>
        <button onClick={abrirCrear} className="categorias-btn-nuevo">
          + Nueva Categoría
        </button>
      </div>

      <div className="categorias-tabla-container">
        <table className="categorias-tabla">
          <thead>
            <tr className="categorias-thead-tr">
              {['#', 'Nombre', 'Descripción', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="categorias-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categorias.map((c, i) => (
              <tr key={c.id_categoria} className={i % 2 === 0 ? 'categorias-tr-par' : 'categorias-tr-impar'}>
                <td className="categorias-td-id">{c.id_categoria}</td>
                <td className="categorias-td-nombre">{c.nombre}</td>
                <td className="categorias-td-descripcion">{c.descripcion}</td>
                <td className="categorias-td-estado">
                  <span className={`categorias-estado-badge ${c.estado ? 'categorias-estado-activo' : 'categorias-estado-inactivo'}`}>
                    {c.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="categorias-td-acciones">
                  <button onClick={() => abrirEditar(c)} className="categorias-btn-editar" title="Editar">
                    <Pencil size={15} />
                  </button>

                  {c.estado === true || c.estado === 1 ? (
                    <button onClick={() => cambiarEstado(c.id_categoria, false)} className="categorias-btn-desactivar" title="Desactivar">
                      <ToggleRight size={15} />
                    </button>
                  ) : (
                    <button onClick={() => cambiarEstado(c.id_categoria, true)} className="categorias-btn-activar" title="Activar">
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
        <div className="categorias-modal-overlay">
          <div className="categorias-modal">
            <h2 className="categorias-modal-titulo">{editId ? 'Editar' : 'Nueva'} Categoría</h2>
            {error && <div className="categorias-modal-error">{error}</div>}
            <form onSubmit={guardar}>
              <div className="categorias-form-group">
                <label className="categorias-form-label">Nombre</label>
                <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="categorias-form-input" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="categorias-form-label">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  rows={3} className="categorias-form-textarea" />
              </div>
              <div className="categorias-modal-botones">
                <button type="button" onClick={() => setModal(false)} className="categorias-btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="categorias-btn-guardar">
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