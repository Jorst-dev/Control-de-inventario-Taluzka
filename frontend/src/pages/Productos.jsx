import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Pencil, ArrowRightLeft, ToggleLeft, ToggleRight, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import './Productos.css'

const FORM_VACIO = {
  nombre: '', id_categoria: '', descripcion: '\n - Marca:\n- Lo que viene:\n- UND:\n- DOC:\n- %:\n- Millar:',
  precio_compra: '', precio: '', tipo_control: 'unidad',
  stock_inicial: 0, stock_minimo: 5,
  nivel_estado: 'LLENO',
}

export default function Productos() {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [buscar, setBuscar] = useState('')
  const [filtroCat, setFiltroCat] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [verDesc, setVerDesc] = useState(null)

  const cargar = () => {
    api.get('/productos/').then(r => setProductos(r.data))
    api.get('/categorias/?activas=true').then(r => setCategorias(r.data))
  }
  useEffect(() => {
    cargar()
    window.addEventListener('focus', cargar)
    return () => window.removeEventListener('focus', cargar)
  }, [])

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
    const matchCat = filtroCat ? String(p.id_categoria) === filtroCat : true
    const matchTipo = filtroTipo ? p.tipo_control === filtroTipo : true
    return matchNombre && matchCat && matchTipo
  })

  const ganancia = (p) => (parseFloat(p.precio) - parseFloat(p.precio_compra)).toFixed(2)
  const margen = (p) => {
    const pc = parseFloat(p.precio_compra)
    if (!pc) return '0%'
    return ((parseFloat(p.precio) - pc) / pc * 100).toFixed(1) + '%'
  }

  const exportarExcel = () => {
    const datos = filtrados.map(p => ({
      Nombre: p.nombre,
      'P. Compra': parseFloat(p.precio_compra).toFixed(2),
      'P. Venta': parseFloat(p.precio).toFixed(2),
      Ganancia: ganancia(p),
      Stock: p.tipo_control === 'nivel'
        ? (p.nivel_estado === 'LLENO' ? 'LLENO' : p.nivel_estado === 'MEDIO' ? 'MEDIO' : 'BAJO')
        : p.stock_actual,
      Tipo: p.tipo_control === 'unidad' ? 'Unidad' : p.tipo_control === 'caja' ? 'Caja' : 'Nivel',
    }))

    const ws = XLSX.utils.json_to_sheet(datos)
    

    ws['!cols'] = [
      { wch: 30 },  // Nombre
      { wch: 12 },  // P. Compra
      { wch: 12 },  // P. Venta
      { wch: 12 },  // Ganancia
      { wch: 10 },  // Stock
      { wch: 10 },  // Tipo
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Productos')
    XLSX.writeFile(wb, 'productos.xlsx')
  }

  return (
    <div>
      <div className="productos-header">
      <h1 className="productos-titulo">Productos</h1>
      <div className="productos-header-botones">
        <button onClick={exportarExcel} className="productos-btn-exportar" title="Exportar a Excel">
          <Download size={16} />
          <span>Excel</span>
        </button>
        <button onClick={abrirCrear} className="productos-btn-nuevo">+ Nuevo Producto</button>
      </div>
    </div>

      <input
        placeholder="Buscar producto..."
        value={buscar} onChange={e => setBuscar(e.target.value)}
        className="productos-buscador"
      />

      <div className="productos-filtros">
        <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)} className="productos-filtro-select">
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
          ))}
        </select>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="productos-filtro-select">
          <option value="">Todos los tipos</option>
          <option value="unidad">Unidades</option>
          <option value="caja">Cajones</option>
          <option value="nivel">Por Nivel</option>
        </select>
      </div>

      <div className="productos-tabla-container">
        <table className="productos-tabla">
          <thead>
            <tr className="productos-thead-tr">
              {['', 'Nombre', 'Categoría', 'P. Compra', 'P. Venta', 'Ganancia', 'Margen', 'Stock Actual', 'Acciones'].map(h => (
                <th key={h} className="productos-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p, i) => (
              <tr key={p.id_producto} className={i % 2 === 0 ? 'productos-tr-par' : 'productos-tr-impar'}>
                <td className="productos-td-ojo">
                  {p.descripcion && (
                    <span onClick={() => setVerDesc(p)} title="Ver descripción" className="productos-ojo-icono">👁️</span>
                  )}
                </td>
                <td className="productos-td-nombre">{p.nombre}</td>
                <td className="productos-td-categoria">{p.categoria}</td>
                <td className="productos-td-precio">S/. {parseFloat(p.precio_compra).toFixed(2)}</td>
                <td className="productos-td-precio">S/. {parseFloat(p.precio).toFixed(2)}</td>
                <td className="productos-td-ganancia">S/. {ganancia(p)}</td>
                <td className="productos-td-margen">{margen(p)}</td>
                <td className="productos-td-stock" style={{
                  color: p.tipo_control === 'nivel' ? '#333' :
                    p.stock_actual <= 0 ? '#dc3545' :
                    p.stock_actual <= p.stock_minimo ? '#fd7e14' : '#28a745'
                }}>
                  {p.tipo_control === 'nivel'
                    ? <span className={`productos-nivel-badge productos-nivel-${p.nivel_estado?.toLowerCase()}`}>
                        {p.nivel_estado === 'LLENO' ? '🟢 LLENO' :
                         p.nivel_estado === 'MEDIO' ? '🟡 MEDIO' : '🔴 BAJO'}
                      </span>
                    : p.stock_actual
                  }
                </td>
                <td className="productos-td-acciones">
                  <button onClick={() => abrirEditar(p)} className="productos-btn-editar" title="Editar">
                    <Pencil size={15} />
                  </button>
                  {p.tipo_control !== 'nivel' && (
                    <button
                      onClick={() => navigate(`/movimientos?id_producto=${p.id_producto}&nombre=${encodeURIComponent(p.nombre)}`)}
                      className="productos-btn-movimientos" title="Movimientos">
                      <ArrowRightLeft size={15} />
                    </button>
                  )}
                  {p.estado === true || p.estado === 1 ? (
                    <button onClick={() => cambiarEstado(p.id_producto, false)} className="productos-btn-desactivar" title="Desactivar">
                      <ToggleRight size={15} />
                    </button>
                  ) : (
                    <button onClick={() => cambiarEstado(p.id_producto, true)} className="productos-btn-activar" title="Activar">
                      <ToggleLeft size={15} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={9} className="productos-sin-datos">Sin productos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="productos-modal-overlay">
          <div className="productos-modal">
            <h2 className="productos-modal-titulo">{editId ? 'Editar' : 'Nuevo'} Producto</h2>
            {error && <div className="productos-modal-error">{error}</div>}
            <form onSubmit={guardar}>
              {[
                { label: 'Nombre', key: 'nombre', type: 'text', required: true },
                { label: 'Precio de Compra (S/.)', key: 'precio_compra', type: 'number', step: '0.01', required: true },
                { label: 'Precio de Venta (S/.)', key: 'precio', type: 'number', step: '0.01', required: true },
              ].map(f => (
                <div key={f.key} className="productos-form-group">
                  <label className="productos-form-label">{f.label}</label>
                  <input type={f.type} step={f.step} required={f.required}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="productos-form-input"
                  />
                </div>
              ))}

              <div className="productos-form-group">
                <label className="productos-form-label">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  rows={5} className="productos-form-textarea" />
              </div>

              <div className="productos-form-group">
                <label className="productos-form-label">Categoría</label>
                <select required value={form.id_categoria}
                  onChange={e => setForm({ ...form, id_categoria: e.target.value })}
                  className="productos-form-select">
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                </select>
              </div>

              <div className="productos-form-group">
                <label className="productos-form-label">Tipo de Control</label>
                <select value={form.tipo_control}
                  onChange={e => setForm({ ...form, tipo_control: e.target.value })}
                  className="productos-form-select">
                  <option value="unidad">Unidad</option>
                  <option value="caja">Caja</option>
                  <option value="nivel">Por Nivel (Verde / Amarillo / Rojo)</option>
                </select>
              </div>

              {form.tipo_control === 'nivel' && (
                <div className="productos-form-group">
                  <label className="productos-form-label">Estado de Nivel</label>
                  <div className="productos-nivel-selector">
                    {[
                      { valor: 'LLENO', label: 'LLENO', bg: '#d4edda', color: '#155724', borde: '#28a745' },
                      { valor: 'MEDIO', label: 'MEDIO', bg: '#fff3cd', color: '#856404', borde: '#e6a817' },
                      { valor: 'BAJO', label: 'BAJO', bg: '#f8d7da', color: '#721c24', borde: '#dc3545' },
                    ].map(n => (
                      <button
                        key={n.valor}
                        type="button"
                        onClick={() => setForm({ ...form, nivel_estado: n.valor })}
                        className={`productos-nivel-btn ${form.nivel_estado === n.valor ? 'seleccionado' : ''}`}
                        style={{
                          borderColor: form.nivel_estado === n.valor ? n.borde : '#ddd',
                          background: form.nivel_estado === n.valor ? n.bg : '#fff',
                          color: form.nivel_estado === n.valor ? n.color : '#aaa',
                        }}
                      >
                        {n.valor === 'LLENO' ? '🟢' : n.valor === 'MEDIO' ? '🟡' : '🔴'} {n.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {form.tipo_control !== 'nivel' && (
                <>
                  {!editId && (
                    <div className="productos-form-group">
                      <label className="productos-form-label">Stock Inicial</label>
                      <input type="number" min="0" value={form.stock_inicial}
                        onChange={e => setForm({ ...form, stock_inicial: parseInt(e.target.value) })}
                        className="productos-form-input" />
                    </div>
                  )}
                  <div className="productos-form-group">
                    <label className="productos-form-label">Stock Mínimo</label>
                    <input type="number" min="0" value={form.stock_minimo}
                      onChange={e => setForm({ ...form, stock_minimo: parseInt(e.target.value) })}
                      className="productos-form-input" />
                  </div>
                </>
              )}

              <div className="productos-modal-botones">
                <button type="button" onClick={() => setModal(false)} className="productos-btn-cancelar">Cancelar</button>
                <button type="submit" className="productos-btn-guardar">{editId ? 'Guardar Cambios' : 'Crear Producto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mini modal descripción */}
      {verDesc && (
        <div onClick={() => setVerDesc(null)} className="productos-desc-overlay">
          <div onClick={e => e.stopPropagation()} className="productos-desc-modal">
            <div className="productos-desc-header">
              <strong className="productos-desc-titulo">{verDesc.nombre}</strong>
              <span onClick={() => setVerDesc(null)} className="productos-desc-cerrar">✕</span>
            </div>
            <pre className="productos-desc-texto">{verDesc.descripcion || 'Sin descripción'}</pre>
          </div>
        </div>
      )}
    </div>
  )
}