from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import os
from werkzeug.utils import secure_filename
import uuid

upload_bp = Blueprint("upload", __name__, url_prefix="/api/upload")

EXTENSIONES_PERMITIDAS = {"png", "jpg", "jpeg", "webp"}
CARPETA_PRODUCTOS = os.path.join("uploads", "productos")


def extension_valida(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in EXTENSIONES_PERMITIDAS


@upload_bp.route("/producto", methods=["POST"])
@jwt_required()
def subir_imagen_producto():
    if "imagen" not in request.files:
        return jsonify({"error": "No se envió ninguna imagen"}), 400

    archivo = request.files["imagen"]
    if archivo.filename == "":
        return jsonify({"error": "Nombre de archivo vacío"}), 400

    if not extension_valida(archivo.filename):
        return jsonify({"error": "Formato no permitido. Usa png, jpg, jpeg o webp"}), 400

    os.makedirs(CARPETA_PRODUCTOS, exist_ok=True)

    extension = archivo.filename.rsplit(".", 1)[1].lower()
    nombre_unico = f"{uuid.uuid4().hex}.{extension}"
    ruta_completa = os.path.join(CARPETA_PRODUCTOS, nombre_unico)
    archivo.save(ruta_completa)

    # Ruta que se guarda en la BD y se usa para mostrar la imagen
    ruta_relativa = f"productos/{nombre_unico}"
    return jsonify({"imagen": ruta_relativa}), 201

@upload_bp.route("/producto/<filename>", methods=["DELETE"])
@jwt_required()
def eliminar_imagen_producto(filename):
    ruta_completa = os.path.join(CARPETA_PRODUCTOS, filename)
    if os.path.exists(ruta_completa):
        os.remove(ruta_completa)
        return jsonify({"msg": "Imagen eliminada"}), 200
    return jsonify({"msg": "Imagen no encontrada"}), 404