# Ferretería Taluzka — Sistema de Control de Inventario

## Estructura del proyecto

```
ferreteria/
├── backend/         ← Flask (Python)
│   ├── app.py
│   ├── requirements.txt
│   ├── .env
│   ├── config/
│   │   └── database.py
│   ├── models/
│   │   └── __init__.py
│   └── routes/
│       ├── auth.py
│       ├── usuarios.py
│       ├── categorias.py
│       ├── productos.py
│       ├── movimientos.py
│       ├── inventario.py
│       └── alertas.py
└── frontend/        ← React + Vite
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── context/AuthContext.jsx
        ├── services/api.js
        ├── components/Layout.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Productos.jsx
            ├── Categorias.jsx
            ├── Inventario.jsx
            ├── Movimientos.jsx
            ├── Alertas.jsx
            └── Usuarios.jsx
```

---

## Instrucciones para correr el proyecto

### 1. Base de datos MySQL
Ejecutar el archivo `ferreteria_taluzka.sql` en tu MySQL:
```sql
SOURCE ferreteria_taluzka.sql;
```

### 2. Backend (Flask)
```bash
cd backend
pip install -r requirements.txt

# Editar el archivo .env con tus datos de MySQL:
# DB_USER=root
# DB_PASSWORD=tu_password

python app.py
# Corre en http://localhost:5000
# Se crea automáticamente: admin@ferreteria.com / admin123
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev
# Corre en http://localhost:5173
```

---

## Endpoints del API

| Método | Ruta                          | Descripción                        |
|--------|-------------------------------|------------------------------------|
| POST   | /api/auth/login               | Iniciar sesión                     |
| GET    | /api/auth/me                  | Datos del usuario logueado         |
| GET    | /api/productos/               | Listar productos                   |
| POST   | /api/productos/               | Crear producto + control inventario|
| PUT    | /api/productos/:id            | Editar producto                    |
| DELETE | /api/productos/:id            | Desactivar producto                |
| GET    | /api/productos/precios/resumen| Ganancia y margen por producto     |
| GET    | /api/categorias/              | Listar categorías                  |
| POST   | /api/categorias/              | Crear categoría                    |
| GET    | /api/inventario/              | Ver inventario completo            |
| GET    | /api/inventario/resumen       | Resumen para dashboard             |
| PUT    | /api/inventario/:id           | Ajustar stock mínimo               |
| POST   | /api/movimientos/             | Registrar entrada o salida         |
| GET    | /api/movimientos/             | Listar movimientos (filtrable)     |
| GET    | /api/alertas/                 | Listar alertas (filtrable)         |
| PUT    | /api/alertas/:id/atender      | Marcar alerta como atendida        |
| PUT    | /api/alertas/:id/ignorar      | Ignorar alerta                     |
| GET    | /api/usuarios/                | Listar usuarios (solo admin)       |
| POST   | /api/usuarios/                | Crear usuario (solo admin)         |
| PUT    | /api/usuarios/:id             | Editar usuario (solo admin)        |
| DELETE | /api/usuarios/:id             | Desactivar usuario (solo admin)    |

---

## Usuario por defecto
- **Email:** admin@ferreteria.com
- **Contraseña:** admin123
- Cambiar la contraseña al primer ingreso.
