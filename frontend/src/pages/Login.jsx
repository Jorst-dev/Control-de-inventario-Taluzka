import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', contrasena: '' })
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
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-titulo">Ferretería Taluzka</h1>
        <p className="login-subtitulo">Sistema de Control de Inventario</p>
        
        {error && (
          <div className="login-error">{error}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-label">Email</label>
            <input
              type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="login-input"
            />
          </div>
          
          <div className="login-form-group login-form-group-password">
            <label className="login-label">Contraseña</label>
            <input
              type="password" required value={form.contrasena}
              onChange={e => setForm({ ...form, contrasena: e.target.value })}
              className="login-input"
            />
          </div>
          
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}