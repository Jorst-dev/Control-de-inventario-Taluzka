from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Categoria(db.Model):
    __tablename__ = "Categoria"
    id_categoria = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre       = db.Column(db.String(80), nullable=False)
    descripcion  = db.Column(db.String(200))
    estado       = db.Column(db.Boolean, default=True, nullable=False)

    productos = db.relationship("Producto", backref="categoria", lazy=True)

    def to_dict(self):
        return {
            "id_categoria": self.id_categoria,
            "nombre":       self.nombre,
            "descripcion":  self.descripcion,
            "estado":       self.estado,
        }


class Usuario(db.Model):
    __tablename__ = "Usuario"
    id_usuario     = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre         = db.Column(db.String(100), nullable=False)
    email          = db.Column(db.String(100), nullable=False, unique=True)
    contrasena     = db.Column(db.String(255), nullable=False)
    rol            = db.Column(db.String(50), nullable=False, default="vendedor")
    estado         = db.Column(db.Boolean, default=True, nullable=False)
    fecha_registro = db.Column(db.Date, default=datetime.utcnow)
    acceso_total   = db.Column(db.Boolean, default=False, nullable=False)

    movimientos = db.relationship("Movimiento", backref="usuario", lazy=True)
    alertas     = db.relationship("Alerta", backref="usuario_atiende", lazy=True)

    def to_dict(self):
        return {
            "id_usuario":     self.id_usuario,
            "nombre":         self.nombre,
            "email":          self.email,
            "rol":            self.rol,
            "estado":         self.estado,
            "fecha_registro": str(self.fecha_registro),
            "acceso_total":   self.acceso_total,
        }


class Producto(db.Model):
    __tablename__ = "Producto"
    id_producto   = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_categoria  = db.Column(db.Integer, db.ForeignKey("Categoria.id_categoria"), nullable=False)
    nombre        = db.Column(db.String(100), nullable=False)
    descripcion   = db.Column(db.String(200))
    precio_compra = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    precio        = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    tipo_control  = db.Column(db.String(20), nullable=False, default="unidad")
    imagen        = db.Column(db.String(255), nullable=True)
    estado        = db.Column(db.Boolean, default=True, nullable=False)

    movimientos      = db.relationship("Movimiento", backref="producto", lazy=True)
    control          = db.relationship("Control_inventario", backref="producto", uselist=False)
    alertas          = db.relationship("Alerta", backref="producto", lazy=True)

    def to_dict(self):
        ctrl = Control_inventario.query.filter_by(id_producto=self.id_producto).first()
        return {
            "id_producto":   self.id_producto,
            "id_categoria":  self.id_categoria,
            "categoria":     self.categoria.nombre if self.categoria else None,
            "nombre":        self.nombre,
            "descripcion":   self.descripcion,
            "precio_compra": float(self.precio_compra),
            "precio":        float(self.precio),
            "ganancia":      round(float(self.precio) - float(self.precio_compra), 2),
            "tipo_control":  self.tipo_control,
            "imagen":        self.imagen,
            "estado":        self.estado,
            "stock_actual":  ctrl.stock_actual if ctrl else 0,
            "stock_minimo":  ctrl.stock_minimo if ctrl else 0,
            "nivel_estado":  ctrl.nivel_estado if ctrl else None,
            "id_control":    ctrl.id_control if ctrl else None,
        }

class Control_inventario(db.Model):
    __tablename__ = "Control_inventario"
    id_control          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_producto         = db.Column(db.Integer, db.ForeignKey("Producto.id_producto"), nullable=False, unique=True)
    tipo_control        = db.Column(db.String(20), nullable=False, default="unidad")
    stock_actual        = db.Column(db.Integer, nullable=False, default=0)
    stock_minimo        = db.Column(db.Integer, nullable=False, default=0)
    cantidad_cajones    = db.Column(db.Integer, default=0)
    cajones_abiertos    = db.Column(db.Integer, default=0)
    
    nivel_estado        = db.Column(db.Enum('LLENO', 'MEDIO', 'BAJO'), nullable=True)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    alertas = db.relationship("Alerta", backref="control", lazy=True)

    def calcular_nivel(self):
        if self.stock_actual <= 0:
            return "critico"
        elif self.stock_actual <= self.stock_minimo:
            return "bajo"
        elif self.stock_actual <= self.stock_minimo * 2:
            return "medio"
        return "alto"

    def to_dict(self):
        return {
            "id_control":          self.id_control,
            "id_producto":         self.id_producto,
            "tipo_control":        self.tipo_control,
            "stock_actual":        self.stock_actual,
            "stock_minimo":        self.stock_minimo,
            "cantidad_cajones":    self.cantidad_cajones,
            "cajones_abiertos":    self.cajones_abiertos,
            
            "nivel_estado":        self.nivel_estado, 
            "fecha_actualizacion": str(self.fecha_actualizacion),
        }


class Movimiento(db.Model):
    __tablename__ = "Movimiento"
    id_movimiento  = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_producto    = db.Column(db.Integer, db.ForeignKey("Producto.id_producto"), nullable=False)
    id_usuario     = db.Column(db.Integer, db.ForeignKey("Usuario.id_usuario"), nullable=False)
    tipo           = db.Column(db.String(20), nullable=False)   # 'entrada' | 'salida'
    cantidad       = db.Column(db.Integer, nullable=False)
    fecha          = db.Column(db.DateTime, default=datetime.utcnow)
    observacion    = db.Column(db.String(200))
    stock_resultado= db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id_movimiento":  self.id_movimiento,
            "id_producto":    self.id_producto,
            "producto":       self.producto.nombre if self.producto else None,
            "id_usuario":     self.id_usuario,
            "usuario":        self.usuario.nombre if self.usuario else None,
            "tipo":           self.tipo,
            "cantidad":       self.cantidad,
            "fecha":          str(self.fecha),
            "observacion":    self.observacion,
            "stock_resultado":self.stock_resultado,
        }


class Alerta(db.Model):
    __tablename__ = "Alerta"
    id_alerta        = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_producto      = db.Column(db.Integer, db.ForeignKey("Producto.id_producto"), nullable=False)
    id_control       = db.Column(db.Integer, db.ForeignKey("Control_inventario.id_control"), nullable=False)
    fecha_generada   = db.Column(db.DateTime, default=datetime.utcnow)
    estado           = db.Column(db.String(200), nullable=False, default="pendiente")
    stock_al_generar = db.Column(db.Integer, nullable=False)
    fecha_atendida   = db.Column(db.DateTime)
    id_usuario       = db.Column(db.Integer, db.ForeignKey("Usuario.id_usuario"))

    def to_dict(self):
        return {
            "id_alerta":        self.id_alerta,
            "id_producto":      self.id_producto,
            "producto":         self.producto.nombre if self.producto else None,
            "id_control":       self.id_control,
            "fecha_generada":   str(self.fecha_generada),
            "estado":           self.estado,
            "stock_al_generar": self.stock_al_generar,
            "fecha_atendida":   str(self.fecha_atendida) if self.fecha_atendida else None,
            "id_usuario":       self.id_usuario,
        }
