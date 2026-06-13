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
from routes.alertas     import alertas_bp
from routes.upload      import upload_bp

import os
import subprocess
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler

def create_app():
    app = Flask(__name__, static_folder='uploads', static_url_path='/uploads')
    app.config.from_object(Config)

    # CORS: permite peticiones desde React (puerto 5173 por defecto con Vite)
    #CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:3000"]}})
    CORS(app)
    db.init_app(app)
    @app.route('/test-uploads')
    def test_uploads():
        import os
        ruta = os.path.join(app.static_folder, 'productos')
        archivos = os.listdir(ruta) if os.path.exists(ruta) else []
        return jsonify({"static_folder": app.static_folder, "existe": os.path.exists(ruta), "archivos": archivos})
    JWTManager(app)

    # Registrar blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(categorias_bp)
    app.register_blueprint(productos_bp)
    app.register_blueprint(movimientos_bp)
    app.register_blueprint(alertas_bp)
    app.register_blueprint(upload_bp)

    # Manejo de errores globales
    @app.errorhandler(404)
    def not_found(e):
        from flask import request
        if request.path.startswith('/uploads/'):
            return e
        return jsonify({"error": "Recurso no encontrado"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Error interno del servidor"}), 500

    # Crear tablas y usuario admin por defecto
    with app.app_context():
        db.create_all()
        _crear_admin_inicial()


    BACKUP_DIR = os.path.join(os.path.dirname(__file__), 'backups')

    def hacer_backup():
        if not os.path.exists(BACKUP_DIR):
            os.makedirs(BACKUP_DIR)
        
        archivo = os.path.join(BACKUP_DIR, 'backup.sql')
        mysqldump_path = r'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe'
        comando = f'"{mysqldump_path}" -h {os.getenv("DB_HOST", "localhost")} -u {os.getenv("DB_USER", "root")} -p{os.getenv("DB_PASSWORD", "")} {os.getenv("DB_NAME", "ferreteria_taluzka")} > {archivo}'
        
        try:
            subprocess.run(comando, shell=True, check=True)
            print(f'✅ Backup generado: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
        except Exception as e:
            print(f'❌ Error al hacer backup: {e}')

    scheduler = BackgroundScheduler()
    scheduler.add_job(hacer_backup, 'interval', hours=1)
    scheduler.start()

    hacer_backup()


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
    app.run(debug=False, port=5000, host='0.0.0.0')