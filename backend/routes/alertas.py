from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import db, Alerta

alertas_bp = Blueprint("alertas", __name__, url_prefix="/api/alertas")


@alertas_bp.route("/", methods=["GET"])
@jwt_required()
def get_alertas():
    estado = request.args.get("estado")
    query  = Alerta.query.order_by(Alerta.fecha_generada.desc())
    if estado:
        query = query.filter_by(estado=estado)
    return jsonify([a.to_dict() for a in query.all()]), 200


@alertas_bp.route("/pendientes/count", methods=["GET"])
@jwt_required()
def contar_pendientes():
    count = Alerta.query.filter(
        Alerta.estado.in_(["pendiente", "en_proceso"])
    ).count()
    return jsonify({"pendientes": count}), 200


# pendiente → en_proceso
@alertas_bp.route("/<int:id>/en_proceso", methods=["PUT"])
@jwt_required()
def pasar_en_proceso(id):
    identity  = get_jwt_identity()
    usuario_id = identity.get("id") if isinstance(identity, dict) else int(identity)
    alerta = Alerta.query.get_or_404(id)
    if alerta.estado != "pendiente":
        return jsonify({"error": "Solo se puede procesar alertas pendientes"}), 400
    alerta.estado     = "en_proceso"
    alerta.id_usuario = usuario_id
    db.session.commit()
    return jsonify(alerta.to_dict()), 200


# en_proceso → recibido
@alertas_bp.route("/<int:id>/recibido", methods=["PUT"])
@jwt_required()
def marcar_recibido(id):
    identity   = get_jwt_identity()
    usuario_id = identity.get("id") if isinstance(identity, dict) else int(identity)
    alerta = Alerta.query.get_or_404(id)
    if alerta.estado != "en_proceso":
        return jsonify({"error": "Solo se puede marcar como recibido alertas en proceso"}), 400
    alerta.estado         = "recibido"
    alerta.fecha_atendida = datetime.utcnow()
    alerta.id_usuario     = usuario_id
    db.session.commit()
    return jsonify(alerta.to_dict()), 200


# cualquier estado activo → ignorada
@alertas_bp.route("/<int:id>/ignorar", methods=["PUT"])
@jwt_required()
def ignorar_alerta(id):
    alerta = Alerta.query.get_or_404(id)
    if alerta.estado == "recibido":
        return jsonify({"error": "No se puede ignorar una alerta ya recibida"}), 400
    alerta.estado = "ignorada"
    db.session.commit()
    return jsonify(alerta.to_dict()), 200