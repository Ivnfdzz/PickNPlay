/**
 * @fileoverview Configuración de asociaciones entre modelos de Sequelize
 * 
 * Este archivo define todas las relaciones entre los modelos de la base de datos
 * para el sistema Pick&Play. Incluye relaciones 1:1, 1:N y N:M necesarias
 * para el funcionamiento del autoservicio de juegos de mesa y cartas.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

// Importación de todos los modelos del sistema
const Rol = require('./rol.model');
const Usuario = require('./usuario.model');
const Pedido = require('./pedido.model');
const DetallePedido = require('./detallePedido.model');
const Producto = require('./producto.model');
const Categoria = require('./categoria.model');
const Subcategoria = require('./subcategoria.model');
const ProductoSubcategoria = require('./productoSubcategoria.model');
const MetodoPago = require('./metodoPago.model');
const Accion = require('./accion.model');
const LogAccionUsuario = require('./logAccionUsuario.model');

/**
 * Establece todas las asociaciones entre los modelos de Sequelize
 * 
 * Define las relaciones bidireccionales necesarias para:
 * - Sistema de usuarios y roles (autenticación/autorización)
 * - Catálogo de productos con categorías y subcategorías
 * - Sistema de pedidos y detalles de compra
 * - Sistema de auditoría para tracking de cambios
 * 
 * @function establecerRelaciones
 * @returns {void}
 */
const establecerRelaciones = () => {
    // ========== SISTEMA DE USUARIOS Y AUTENTICACIÓN ==========
    
    /**
     * Relación Rol -> Usuario (1:N)
     * Un rol puede tener múltiples usuarios (root, analista, repositor)
     */
    Rol.hasMany(Usuario, { foreignKey: 'id_rol' });
    Usuario.belongsTo(Rol, { foreignKey: 'id_rol' });

    // ========== SISTEMA DE PEDIDOS Y FACTURACIÓN ==========
    
    /**
     * Relación Pedido -> DetallePedido (1:N)
     * Un pedido contiene múltiples líneas de productos
     */
    Pedido.hasMany(DetallePedido, { foreignKey: 'id_pedido' });
    DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido' });

    /**
     * Relación Producto -> DetallePedido (1:N)
     * Un producto puede aparecer en múltiples detalles de pedidos
     */
    Producto.hasMany(DetallePedido, { foreignKey: 'id_producto' });
    DetallePedido.belongsTo(Producto, { foreignKey: 'id_producto' });

    /**
     * Relación MetodoPago -> Pedido (1:N)
     * Un método de pago puede usarse en múltiples pedidos
     */
    MetodoPago.hasMany(Pedido, { foreignKey: 'id_metodopago' });
    Pedido.belongsTo(MetodoPago, { foreignKey: 'id_metodopago' });

    // ========== CATÁLOGO DE PRODUCTOS ==========
    
    /**
     * Relación Categoria -> Subcategoria (1:N)
     * Una categoría (ej: "Juegos de Mesa") tiene múltiples subcategorías (ej: "Estrategia", "Familiar")
     * Se define alias 'subcategorias' para facilitar consultas
     */
    Categoria.hasMany(Subcategoria, { 
        foreignKey: 'id_categoria',
        as: 'subcategorias'
    });

    Subcategoria.belongsTo(Categoria, { 
        foreignKey: 'id_categoria',
        as: 'categoria'
    });

    /**
     * Relación Producto <-> Subcategoria (N:M)
     * Un producto puede pertenecer a múltiples subcategorías y viceversa
     * Ejemplo: "UNO" puede estar en "Familiar" y "Rápidos"
     * Usa tabla intermedia ProductoSubcategoria
     */
    Producto.belongsToMany(Subcategoria, { 
        through: ProductoSubcategoria, 
        foreignKey: 'id_producto',
        otherKey: 'id_subcategoria',
        as: 'subcategorias'
    });

    Subcategoria.belongsToMany(Producto, { 
        through: ProductoSubcategoria, 
        foreignKey: 'id_subcategoria',
        otherKey: 'id_producto',
        as: 'productos'
    });

    /**
     * Relaciones directas con tabla intermedia ProductoSubcategoria
     * Necesarias para consultas directas sobre la tabla de unión
     * Permiten acceder a metadatos adicionales si se requieren en el futuro
     */
    Producto.hasMany(ProductoSubcategoria, { foreignKey: 'id_producto' });
    ProductoSubcategoria.belongsTo(Producto, { foreignKey: 'id_producto' });

    Subcategoria.hasMany(ProductoSubcategoria, { foreignKey: 'id_subcategoria' });
    ProductoSubcategoria.belongsTo(Subcategoria, { foreignKey: 'id_subcategoria' });

    // ========== SISTEMA DE AUDITORÍA ==========
    
    /**
     * Relaciones del sistema de logs para auditoría administrativa
     * Registra automáticamente todas las acciones de usuarios admin sobre productos
     * 
     * - Usuario -> LogAccionUsuario: Quién realizó la acción
     * - Accion -> LogAccionUsuario: Qué tipo de acción (crear, actualizar, eliminar)
     * - Producto -> LogAccionUsuario: Sobre qué producto se realizó la acción
     * 
     * No se usan alias porque los nombres son autoexplicativos
     */
    Usuario.hasMany(LogAccionUsuario, { foreignKey: 'id_usuario' });
    LogAccionUsuario.belongsTo(Usuario, { foreignKey: 'id_usuario' });

    Accion.hasMany(LogAccionUsuario, { foreignKey: 'id_accion' });
    LogAccionUsuario.belongsTo(Accion, { foreignKey: 'id_accion' });

    Producto.hasMany(LogAccionUsuario, { foreignKey: 'id_producto' });
    LogAccionUsuario.belongsTo(Producto, { foreignKey: 'id_producto' });
};

/**
 * Exporta la función de configuración de asociaciones
 * Se ejecuta una vez durante la inicialización de la aplicación
 * para establecer todas las relaciones entre modelos
 */
module.exports = establecerRelaciones;