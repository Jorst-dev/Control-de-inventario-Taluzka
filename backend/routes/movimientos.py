from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from models import db, Movimiento, Producto, Control_inventario, Alerta

movimientos_bp = Blueprint("movimientos", __name__, url_prefix="/api/movimientos")


def _generar_alerta_si_necesario(control, producto):
    """Genera una alerta si el stock cae al nivel mínimo o menos."""
    if control.stock_actual <= control.stock_minimo:
        alerta_existente = Alerta.query.filter_by(
            id_producto=producto.id_producto,
            estado="pendiente"
        ).first()
        if not alerta_existente:
            alerta = Alerta(
                id_producto      = producto.id_producto,
                id_control       = control.id_control,
                stock_al_generar = control.stock_actual,
                estado           = "pendiente",
            )
            db.session.add(alerta)


@movimientos_bp.route("/", methods=["GET"])
@jwt_required()
def get_movimientos():
    id_producto = request.args.get("id_producto", type=int)
    tipo        = request.args.get("tipo")
    limit       = request.args.get("limit", 50, type=int)

    query = Movimiento.query.order_by(Movimiento.fecha.desc())
    if id_producto:
        query = query.filter_by(id_producto=id_producto)
    if tipo:
        query = query.filter_by(tipo=tipo)

    return jsonify([m.to_dict() for m in query.limit(limit).all()]), 200

@movimientos_bp.route("/resumen/hoy", methods=["GET"])
@jwt_required()
def resumen_hoy():
    from datetime import datetime
    hoy_str = datetime.utcnow().strftime('%Y-%m-%d')
    
    entradas = Movimiento.query.filter(
        Movimiento.tipo == "entrada",
        db.func.date(Movimiento.fecha) == hoy_str
    ).count()
    salidas = Movimiento.query.filter(
        Movimiento.tipo == "salida",
        db.func.date(Movimiento.fecha) == hoy_str
    ).count()
    return jsonify({
        "entradas_hoy": entradas,
        "salidas_hoy":  salidas,
    }), 200





#@movimientos_bp.route("/", methods=["POST"])
@movimientos_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_movimiento(id):
    m = Movimiento.query.get_or_404(id)
    return jsonify(m.to_dict()), 200


@movimientos_bp.route("/", methods=["POST"])
@jwt_required()
def registrar_movimiento():
    identity   = get_jwt_identity()
    usuario_id = identity.get("id") if isinstance(identity, dict) else int(identity)
    data = request.get_json()

    campos = ["id_producto", "tipo", "cantidad"]
    for c in campos:
        if data.get(c) is None:
            return jsonify({"error": f"Campo requerido: {c}"}), 400

    if data["tipo"] not in ["entrada", "salida"]:
        return jsonify({"error": "tipo debe ser 'entrada' o 'salida'"}), 400

    if int(data["cantidad"]) <= 0:
        return jsonify({"error": "La cantidad debe ser mayor a 0"}), 400

    producto = Producto.query.get_or_404(data["id_producto"])
    control  = Control_inventario.query.filter_by(id_producto=producto.id_producto).first()

    if not control:
        return jsonify({"error": "El producto no tiene control de inventario"}), 400

    cantidad = int(data["cantidad"])

    # Validar stock suficiente para salida
    if data["tipo"] == "salida":
        if control.stock_actual < cantidad:
            return jsonify({
                "error": f"Stock insuficiente. Stock actual: {control.stock_actual}"
            }), 400
        control.stock_actual -= cantidad
    else:
        control.stock_actual += cantidad

        if control.stock_actual > control.stock_minimo:
            Alerta.query.filter_by(
                id_producto=producto.id_producto,
                estado="pendiente"
            ).update({"estado": "resuelta"})
    # Actualizar nivel
    #control.nivel_actual        = control.calcular_nivel()
    #control.fecha_actualizacion = datetime.utcnow()
    #control.fecha_actualizacion = datetime.utcnow()

    # Registrar movimiento
    nuevo_movimiento = Movimiento(
        id_producto     = producto.id_producto,
        id_usuario      = usuario_id,
        tipo            = data["tipo"],
        cantidad        = cantidad,
        observacion     = data.get("observacion", ""),
        stock_resultado = control.stock_actual,
    )
    db.session.add(nuevo_movimiento)

    # Generar alerta si el stock está bajo
    _generar_alerta_si_necesario(control, producto)

    db.session.commit()
    return jsonify(nuevo_movimiento.to_dict()), 201

