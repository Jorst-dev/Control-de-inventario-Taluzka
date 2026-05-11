from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from models import db, Alerta

alertas_bp = Blueprint("alertas", __name__, url_prefix="/api/alertas")


@alertas_bp.route("/", methods=["GET"])
@jwt_required()
def get_alertas():
    estado = request.args.get("estado")  # pendiente, atendida, ignorada
    query  = Alerta.query.order_by(Alerta.fecha_generada.desc())
    if estado:
        query = query.filter_by(estado=estado)
    return jsonify([a.to_dict() for a in query.all()]), 200


@alertas_bp.route("/pendientes/count", methods=["GET"])
@jwt_required()
def contar_pendientes():
    count = Alerta.query.filter_by(estado="pendiente").count()
    return jsonify({"pendientes": count}), 200


@alertas_bp.route("/<int:id>/atender", methods=["PUT"])
@jwt_required()
def atender_alerta(id):
    usuario_id = int(get_jwt_identity())
    alerta = Alerta.query.get_or_404(id)
    alerta.estado         = "atendida"
    alerta.fecha_atendida = datetime.utcnow()
    alerta.id_usuario     = usuario_id  # ✅ CORREGIDO
    db.session.commit()
    return jsonify(alerta.to_dict()), 200


@alertas_bp.route("/<int:id>/ignorar", methods=["PUT"])
@jwt_required()
def ignorar_alerta(id):
    alerta = Alerta.query.get_or_404(id)
    alerta.estado = "ignorada"
    db.session.commit()
    return jsonify(alerta.to_dict()), 200
