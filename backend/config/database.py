import os
from datetime import timedelta
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

class Config:
    # Manejo seguro de la contraseña
    password = quote_plus(os.getenv("DB_PASSWORD"))

    # Configuración de base de datos MySQL
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{password}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
        f"?charset=utf8mb4"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración JWT - ¡COMPLETA Y CORRECTA!
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "clave_por_defecto_insegura")
    JWT_TOKEN_LOCATION = ['headers']  # Busca el token en los headers HTTP
    JWT_HEADER_TYPE = 'Bearer'        # Espera el formato: Bearer <token>
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)  # Token expira en 8 horas
    
    # Clave secreta para sesiones de Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "ferreteria_secret_default")