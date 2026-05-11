from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Categoria

categorias_bp = Blueprint("categorias", __name__, url_prefix="/api/categorias")


@categorias_bp.route("/", methods=["GET"])
@jwt_required()
def get_categorias():
    solo_activas = request.args.get("activas", "false").lower() == "true"
    query = Categoria.query
    if solo_activas:
        query = query.filter_by(estado=True)
    return jsonify([c.to_dict() for c in query.all()]), 200


@categorias_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_categoria(id):
    cat = Categoria.query.get_or_404(id)
    return jsonify(cat.to_dict()), 200


@categorias_bp.route("/", methods=["POST"])
@jwt_required()
def crear_categoria():
    data = request.get_json()
    if not data.get("nombre"):
        return jsonify({"error": "El nombre es requerido"}), 400

    cat = Categoria(
        nombre      = data["nombre"],
        descripcion = data.get("descripcion", ""),
    )
    db.session.add(cat)
    db.session.commit()
    return jsonify(cat.to_dict()), 201


@categorias_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def actualizar_categoria(id):
    cat = Categoria.query.get_or_404(id)
    data = request.get_json()
    cat.nombre      = data.get("nombre", cat.nombre)
    cat.descripcion = data.get("descripcion", cat.descripcion)
    cat.estado      = data.get("estado", cat.estado)
    db.session.commit()
    return jsonify(cat.to_dict()), 200


@categorias_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def eliminar_categoria(id):
    cat = Categoria.query.get_or_404(id)
    cat.estado = False
    db.session.commit()
    return jsonify({"mensaje": "Categoría desactivada"}), 200
