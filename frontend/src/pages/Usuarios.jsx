import { useEffect, useState } from 'react'
import api from '../services/api'

const FORM_VACIO = { nombre: '', email: '', contrasena: '', rol: 'vendedor', acceso_total: false }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState(FORM_VACIO)
  const [editId,   setEditId]   = useState(null)
  const [error,    setError]    = useState('')

  useEffect(() => {
    cargar()
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
      else        await api.post('/usuarios/', payload)
      setModal(false); cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    }
  }

  const desactivar = async (id) => {
    if (!confirm('¿Desactivar este usuario?')) return
    await api.delete(`/usuarios/${id}`); cargar()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: '#1e3a5f' }}>Usuarios (Solo Admin)</h1>
        <button onClick={abrirCrear}
          style={{ background: '#1e3a5f', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer' }}>
          + Nuevo Usuario
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#1e3a5f', color: '#fff' }}>
              {['Nombre','Email','Rol','Acceso Total','Estado','Registro','Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, i) => (
              <tr key={u.id_usuario} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{u.nombre}</td>
                <td style={{ padding: '10px 14px' }}>{u.email}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: u.rol === 'admin' ? '#d4edda' : '#e2e3e5',
                    color: u.rol === 'admin' ? '#155724' : '#333',
                    padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>
                    {u.rol}
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>{u.acceso_total ? '✅' : '❌'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: u.estado ? '#d4edda' : '#f8d7da',
                    color: u.estado ? '#155724' : '#721c24',
                    padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>
                    {u.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}>{u.fecha_registro}</td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 6 }}>
                  <button onClick={() => abrirEditar(u)}
                    style={{ background: '#1e3a5f', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    Editar
                  </button>
                  <button onClick={() => desactivar(u.id_usuario)}
                    style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    Desactivar
                  </button>
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
            <h2 style={{ marginTop: 0, color: '#1e3a5f' }}>{editId ? 'Editar' : 'Nuevo'} Usuario</h2>
            {error && <div style={{ background: '#fee', padding: 10, borderRadius: 4, marginBottom: 12, color: '#c00' }}>{error}</div>}
            <form onSubmit={guardar}>
              {[
                { label: 'Nombre', key: 'nombre', type: 'text', required: true },
                { label: 'Email',  key: 'email',  type: 'email', required: true },
                { label: editId ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña', key: 'contrasena', type: 'password', required: !editId },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>{f.label}</label>
                  <input type={f.type} required={f.required} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Rol</label>
                <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }}>
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="acceso_total" checked={form.acceso_total}
                  onChange={e => setForm({ ...form, acceso_total: e.target.checked })} />
                <label htmlFor="acceso_total" style={{ fontSize: 14 }}>Acceso total al sistema</label>
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
