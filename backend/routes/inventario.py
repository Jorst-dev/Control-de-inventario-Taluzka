from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Control_inventario, Producto

inventario_bp = Blueprint("inventario", __name__, url_prefix="/api/inventario")


@inventario_bp.route("/", methods=["GET"])
@jwt_required()
def get_inventario():
    """Lista completa del inventario con datos del producto."""
    controles = (
        Control_inventario.query
        .join(Producto)
        .filter(Producto.estado == True)
        .all()
    )
    resultado = []
    for c in controles:
        d = c.to_dict()
        d["producto"]       = c.producto.nombre
        d["categoria"]      = c.producto.categoria.nombre if c.producto.categoria else None
        d["precio_compra"]  = float(c.producto.precio_compra)
        d["precio_venta"]   = float(c.producto.precio)
        resultado.append(d)
    return jsonify(resultado), 200


@inventario_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_control(id):
    control = Control_inventario.query.get_or_404(id)
    d = control.to_dict()
    d["producto"] = control.producto.nombre
    return jsonify(d), 200


@inventario_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def actualizar_control(id):
    """Permite ajustar stock_minimo, cajones, etc."""
    control = Control_inventario.query.get_or_404(id)
    data = request.get_json()
    control.stock_minimo     = data.get("stock_minimo", control.stock_minimo)
    control.cantidad_cajones = data.get("cantidad_cajones", control.cantidad_cajones)
    control.cajones_abiertos = data.get("cajones_abiertos", control.cajones_abiertos)
    control.nivel_actual     = control.calcular_nivel()
    db.session.commit()
    return jsonify(control.to_dict()), 200


@inventario_bp.route("/resumen", methods=["GET"])
@jwt_required()
def resumen_inventario():
    """Resumen para el dashboard: totales y niveles."""
    controles = (
        Control_inventario.query.join(Producto).filter(Producto.estado == True).all()
    )
    total  = len(controles)
    lleno  = 0
    medio  = 0
    bajo   = 0

    for c in controles:
        if c.tipo_control == "nivel":
            # Usa nivel_estado (ENUM: LLENO, MEDIO, BAJO)
            if c.nivel_estado == "LLENO":
                lleno += 1
            elif c.nivel_estado == "MEDIO":
                medio += 1
            else:
                bajo += 1
        else:
            # Usa stock numérico para unidad y caja
            if c.stock_actual <= 0 or c.stock_actual <= c.stock_minimo:
                bajo += 1
            elif c.stock_actual <= c.stock_minimo * 2:
                medio += 1
            else:
                lleno += 1

    return jsonify({
        "total_productos": total,
        "nivel_alto":      lleno,   # verde
        "nivel_medio":     medio,   # amarillo
        "nivel_bajo":      bajo,    # rojo
        "nivel_critico":   0,       # ya no se usa, queda en 0
    }), 200
