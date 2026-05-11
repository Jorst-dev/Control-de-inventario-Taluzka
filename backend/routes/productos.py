from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Producto, Control_inventario

productos_bp = Blueprint("productos", __name__, url_prefix="/api/productos")


@productos_bp.route("/", methods=["GET"])
@jwt_required()
def get_productos():
    solo_activos = request.args.get("activos", "false").lower() == "true"
    query = Producto.query
    if solo_activos:
        query = query.filter_by(estado=True)
    if request.args.get("id_categoria"):
        query = query.filter_by(id_categoria=request.args.get("id_categoria", type=int))
    if request.args.get("tipo_control"):
        query = query.filter_by(tipo_control=request.args.get("tipo_control"))
    return jsonify([p.to_dict() for p in query.all()]), 200


@productos_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_producto(id):
    p = Producto.query.get_or_404(id)
    data = p.to_dict()
    if p.control:
        data["control"] = p.control.to_dict()
    return jsonify(data), 200


@productos_bp.route("/", methods=["POST"])
@jwt_required()
def crear_producto():
    data = request.get_json()
    campos = ["nombre", "id_categoria", "precio_compra", "precio"]
    for c in campos:
        if data.get(c) is None:
            return jsonify({"error": f"Campo requerido: {c}"}), 400

    if float(data["precio_compra"]) > float(data["precio"]):
        return jsonify({"error": "El precio de venta no puede ser menor al precio de compra"}), 400

    producto = Producto(
        id_categoria  = data["id_categoria"],
        nombre        = data["nombre"],
        descripcion   = data.get("descripcion", ""),
        precio_compra = data["precio_compra"],
        precio        = data["precio"],
        tipo_control  = data.get("tipo_control", "unidad"),
    )
    db.session.add(producto)
    db.session.flush()  # Obtener id_producto antes del commit

    # Crear automáticamente el control de inventario
    control = Control_inventario(
        id_producto      = producto.id_producto,
        tipo_control     = producto.tipo_control,
        stock_actual     = data.get("stock_inicial", 0),
        stock_minimo     = data.get("stock_minimo", 5),
        nivel_estado = data.get("nivel_estado", "LLENO") if es_nivel else None,
    )
    db.session.add(control)
    db.session.commit()
    return jsonify(producto.to_dict()), 201


@productos_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def actualizar_producto(id):
    producto = Producto.query.get_or_404(id)
    data = request.get_json()

    precio_compra = float(data.get("precio_compra", producto.precio_compra))
    precio        = float(data.get("precio", producto.precio))

    if precio_compra > precio:
        return jsonify({"error": "El precio de venta no puede ser menor al precio de compra"}), 400

    producto.id_categoria  = data.get("id_categoria", producto.id_categoria)
    producto.nombre        = data.get("nombre", producto.nombre)
    producto.descripcion   = data.get("descripcion", producto.descripcion)
    producto.precio_compra = precio_compra
    producto.precio        = precio
    producto.tipo_control  = data.get("tipo_control", producto.tipo_control)
    producto.estado        = data.get("estado", producto.estado)

    # Actualizar también el tipo_control del control de inventario
    if producto.control:
        producto.control.tipo_control = producto.tipo_control
        if producto.tipo_control == "nivel":
            producto.control.nivel_estado = data.get("nivel_estado", producto.control.nivel_estado)
        else:
            producto.control.nivel_estado = None

    db.session.commit()
    return jsonify(producto.to_dict()), 200


@productos_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def eliminar_producto(id):
    producto = Producto.query.get_or_404(id)
    producto.estado = False
    db.session.commit()
    return jsonify({"mensaje": "Producto desactivado"}), 200


# Endpoint especial: ganancia y margen de todos los productos
@productos_bp.route("/precios/resumen", methods=["GET"])
@jwt_required()
def resumen_precios():
    productos = Producto.query.filter_by(estado=True).all()
    resultado = []
    for p in productos:
        pc = float(p.precio_compra)
        pv = float(p.precio)
        ganancia = pv - pc
        margen = round((ganancia / pc * 100), 2) if pc > 0 else 0
        resultado.append({
            "id_producto":   p.id_producto,
            "nombre":        p.nombre,
            "precio_compra": pc,
            "precio_venta":  pv,
            "ganancia":      ganancia,
            "margen_%":      margen,
            "stock_actual":  p.control.stock_actual if p.control else 0,
        })
    return jsonify(resultado), 200
