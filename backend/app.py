from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import bcrypt

from config.database import Config
from models import db, Usuario

# Rutas
from routes.auth       import auth_bp
from routes.usuarios   import usuarios_bp
from routes.categorias import categorias_bp
from routes.productos  import productos_bp
from routes.movimientos import movimientos_bp
from routes.inventario import inventario_bp
from routes.alertas    import alertas_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS: permite peticiones desde React (puerto 5173 por defecto con Vite)
    #CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:3000"]}})
    CORS(app)
    db.init_app(app)
    JWTManager(app)

    # Registrar blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(categorias_bp)
    app.register_blueprint(productos_bp)
    app.register_blueprint(movimientos_bp)
    app.register_blueprint(inventario_bp)
    app.register_blueprint(alertas_bp)

    # Manejo de errores globales
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Recurso no encontrado"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Error interno del servidor"}), 500

    # Crear tablas y usuario admin por defecto
    with app.app_context():
        db.create_all()
        _crear_admin_inicial()

    return app


def _crear_admin_inicial():
    """Crea el usuario admin si no existe ninguno."""
    if not Usuario.query.filter_by(rol="admin").first():
        hash_pw = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt())
        admin = Usuario(
            nombre       = "Administrador",
            email        = "admin@ferreteria.com",
            contrasena   = hash_pw.decode(),
            rol          = "admin",
            acceso_total = True,
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Usuario admin creado: admin@ferreteria.com / admin123")


#if __name__ == "__main__":
    #app = create_app()
    #app.run(debug=True, port=5000)

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)