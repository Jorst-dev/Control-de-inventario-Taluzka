from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
import bcrypt
from models import db, Usuario

usuarios_bp = Blueprint("usuarios", __name__, url_prefix="/api/usuarios")


def solo_admin():
    claims = get_jwt()
    if claims["rol"] != "admin":
        return jsonify({"error": "Acceso solo para administradores"}), 403
    return None


# GET todos los usuarios
@usuarios_bp.route("/", methods=["GET"])
@jwt_required()
def get_usuarios():
    err = solo_admin()
    if err: return err
    usuarios = Usuario.query.all()
    return jsonify([u.to_dict() for u in usuarios]), 200


# GET un usuario
@usuarios_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    return jsonify(usuario.to_dict()), 200


# POST crear usuario
@usuarios_bp.route("/", methods=["POST"])
@jwt_required()
def crear_usuario():
    err = solo_admin()
    if err: return err
    data = request.get_json()

    campos = ["nombre", "email", "contrasena", "rol"]
    for campo in campos:
        if not data.get(campo):
            return jsonify({"error": f"Campo requerido: {campo}"}), 400

    if Usuario.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "El email ya está registrado"}), 409

    hash_pw = bcrypt.hashpw(data["contrasena"].encode(), bcrypt.gensalt())
    nuevo = Usuario(
        nombre       = data["nombre"],
        email        = data["email"],
        contrasena   = hash_pw.decode(),
        rol          = data.get("rol", "vendedor"),
        acceso_total = data.get("acceso_total", False),
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify(nuevo.to_dict()), 201


# PUT actualizar usuario
@usuarios_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def actualizar_usuario(id):
    err = solo_admin()
    if err: return err
    usuario = Usuario.query.get_or_404(id)
    data = request.get_json()

    usuario.nombre       = data.get("nombre", usuario.nombre)
    usuario.email        = data.get("email", usuario.email)
    usuario.rol          = data.get("rol", usuario.rol)
    usuario.acceso_total = data.get("acceso_total", usuario.acceso_total)
    if "estado" in data:
        usuario.estado = data["estado"]

    if data.get("contrasena"):
        hash_pw = bcrypt.hashpw(data["contrasena"].encode(), bcrypt.gensalt())
        usuario.contrasena = hash_pw.decode()

    db.session.commit()
    return jsonify(usuario.to_dict()), 200


# DELETE (desactivar) usuario
@usuarios_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def eliminar_usuario(id):
    err = solo_admin()
    if err: return err
    usuario = Usuario.query.get_or_404(id)
    usuario.estado = False
    db.session.commit()
    return jsonify({"mensaje": "Usuario desactivado"}), 200
