import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ email: '', contrasena: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.contrasena)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f4f6f9' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: 360 }}>
        <h1 style={{ textAlign: 'center', color: '#1e3a5f', marginBottom: 8 }}>
          Ferretería Taluzka
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: 30 }}>
          Sistema de Control de Inventario
        </p>
        {error && (
          <div style={{ background: '#fee', border: '1px solid #fcc',
            padding: '10px 14px', borderRadius: 4, marginBottom: 16, color: '#c00' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd',
                borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
              Contraseña
            </label>
            <input
              type="password" required value={form.contrasena}
              onChange={e => setForm({ ...form, contrasena: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd',
                borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#1e3a5f',
              color: '#fff', border: 'none', borderRadius: 4, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
