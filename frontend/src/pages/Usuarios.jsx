import { useEffect, useState } from 'react'
import api from '../services/api'
import { Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import './Usuarios.css'

const FORM_VACIO = { nombre: '', email: '', contrasena: '', rol: 'vendedor', acceso_total: false }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    cargar()
    window.addEventListener('focus', cargar)
    return () => window.removeEventListener('focus', cargar)
  }, [])

  const cargar = () => api.get('/usuarios/').then(r => setUsuarios(r.data))

  const abrirCrear = () => { setForm(FORM_VACIO); setEditId(null); setError(''); setModal(true) }
  const abrirEditar = (u) => {
    setForm({ nombre: u.nombre, email: u.email, contrasena: '', rol: u.rol, acceso_total: u.acceso_total })
    setEditId(u.id_usuario); setError(''); setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault(); setError('')
    try {
      const payload = { ...form }
      if (editId && !payload.contrasena) delete payload.contrasena
      if (editId) await api.put(`/usuarios/${editId}`, payload)
      else await api.post('/usuarios/', payload)
      setModal(false); cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    }
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    const mensaje = nuevoEstado ? '¿Activar este usuario?' : '¿Desactivar este usuario?'
    if (!confirm(mensaje)) return
    await api.put(`/usuarios/${id}`, { estado: nuevoEstado })
    cargar()
  }

  return (
    <div>
      <div className="usuarios-header">
        <h1 className="usuarios-titulo">Usuarios (Solo Admin)</h1>
        <button onClick={abrirCrear} className="usuarios-btn-nuevo">+ Nuevo Usuario</button>
      </div>

      <div className="usuarios-tabla-container">
        <table className="usuarios-tabla">
          <thead>
            <tr className="usuarios-thead-tr">
              {['Nombre', 'Email', 'Rol', 'Acceso Total', 'Estado', 'Registro', 'Acciones'].map(h => (
                <th key={h} className="usuarios-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, i) => (
              <tr key={u.id_usuario} className={i % 2 === 0 ? 'usuarios-tr-par' : 'usuarios-tr-impar'}>
                <td className="usuarios-td-nombre">{u.nombre}</td>
                <td className="usuarios-td-email">{u.email}</td>
                <td className="usuarios-td-rol">
                  <span className={`usuarios-rol-badge ${u.rol === 'admin' ? 'usuarios-rol-admin' : 'usuarios-rol-vendedor'}`}>
                    {u.rol}
                  </span>
                </td>
                <td className="usuarios-td-acceso">{u.acceso_total ? '✅' : '❌'}</td>
                <td className="usuarios-td-estado">
                  <span className={`usuarios-estado-badge ${u.estado ? 'usuarios-estado-activo' : 'usuarios-estado-inactivo'}`}>
                    {u.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="usuarios-td-registro">{u.fecha_registro}</td>
                <td className="usuarios-td-acciones">
                  <button onClick={() => abrirEditar(u)} className="usuarios-btn-editar" title="Editar">
                    <Pencil size={15} />
                  </button>
                  {u.estado === true || u.estado === 1 ? (
                    <button onClick={() => cambiarEstado(u.id_usuario, false)} className="usuarios-btn-desactivar" title="Desactivar">
                      <ToggleRight size={15} />
                    </button>
                  ) : (
                    <button onClick={() => cambiarEstado(u.id_usuario, true)} className="usuarios-btn-activar" title="Activar">
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
        <div className="usuarios-modal-overlay">
          <div className="usuarios-modal">
            <h2 className="usuarios-modal-titulo">{editId ? 'Editar' : 'Nuevo'} Usuario</h2>
            {error && <div className="usuarios-modal-error">{error}</div>}
            <form onSubmit={guardar}>
              {[
                { label: 'Nombre', key: 'nombre', type: 'text', required: true },
                { label: 'Email', key: 'email', type: 'email', required: true },
                { label: editId ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña', key: 'contrasena', type: 'password', required: !editId },
              ].map(f => (
                <div key={f.key} className="usuarios-form-group">
                  <label className="usuarios-form-label">{f.label}</label>
                  <input type={f.type} required={f.required} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="usuarios-form-input" />
                </div>
              ))}
              <div className="usuarios-form-group">
                <label className="usuarios-form-label">Rol</label>
                <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}
                  className="usuarios-form-select">
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="usuarios-form-checkbox">
                <input type="checkbox" id="acceso_total" checked={form.acceso_total}
                  onChange={e => setForm({ ...form, acceso_total: e.target.checked })} />
                <label htmlFor="acceso_total">Acceso total al sistema</label>
              </div>
              <div className="usuarios-modal-botones">
                <button type="button" onClick={() => setModal(false)} className="usuarios-btn-cancelar">Cancelar</button>
                <button type="submit" className="usuarios-btn-guardar">{editId ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}