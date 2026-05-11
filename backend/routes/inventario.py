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
    total      = len(controles)
    alto       = sum(1 for c in controles if c.nivel_actual == "alto")
    medio      = sum(1 for c in controles if c.nivel_actual == "medio")
    bajo       = sum(1 for c in controles if c.nivel_actual == "bajo")
    critico    = sum(1 for c in controles if c.nivel_actual == "critico")
    return jsonify({
        "total_productos": total,
        "nivel_alto":      alto,
        "nivel_medio":     medio,
        "nivel_bajo":      bajo,
        "nivel_critico":   critico,
    }), 200
