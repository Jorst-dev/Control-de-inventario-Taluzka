from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
import bcrypt
from models import db, Usuario

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("contrasena"):
        return jsonify({"error": "Email y contraseña requeridos"}), 400

    usuario = Usuario.query.filter_by(email=data["email"], estado=True).first()
    if not usuario:
        return jsonify({"error": "Credenciales inválidas"}), 401

    if not bcrypt.checkpw(data["contrasena"].encode(), usuario.contrasena.encode()):
        return jsonify({"error": "Credenciales inválidas"}), 401

    # ✅ CORREGIDO: identity como string, datos extra en additional_claims
    token = create_access_token(
        identity=str(usuario.id_usuario),
        additional_claims={
            "rol": usuario.rol,
            "nombre": usuario.nombre
        }
    )
    return jsonify({"token": token, "usuario": usuario.to_dict()}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    # ✅ CORREGIDO: convertir a int
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(usuario.to_dict()), 200


@auth_bp.route("/cambiar-password", methods=["PUT"])
@jwt_required()
def cambiar_password():
    # ✅ CORREGIDO: convertir a int
    usuario_id = int(get_jwt_identity())
    data = request.get_json()
    usuario = Usuario.query.get(usuario_id)

    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if not bcrypt.checkpw(data["password_actual"].encode(), usuario.contrasena.encode()):
        return jsonify({"error": "Contraseña actual incorrecta"}), 400

    nuevo_hash = bcrypt.hashpw(data["nueva_password"].encode(), bcrypt.gensalt())
    usuario.contrasena = nuevo_hash.decode()
    db.session.commit()
    return jsonify({"mensaje": "Contraseña actualizada"}), 200