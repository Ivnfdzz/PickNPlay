/**
 * @fileoverview Modelo de Detalle de Pedido para el sistema Pick&Play
 * 
 * Representa la tabla intermedia que almacena los productos específicos
 * incluidos en cada pedido, junto con su cantidad y precio al momento
 * de la transacción. Esta tabla implementa la relación many-to-many
 * entre Pedido y Producto.
 * 
 * Cada registro representa un ítem del pedido, permitiendo que un pedido
 * contenga múltiples productos diferentes y preservando el historial
 * de precios para auditoría y reportes.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

/**
 * Modelo Sequelize para la gestión de ítems específicos dentro de pedidos
 * 
 * @typedef {Object} DetallePedidoAttributes
 * @property {number} id_detalle - Identificador único del detalle (clave primaria)
 * @property {number} id_pedido - Referencia al pedido padre
 * @property {number} id_producto - Referencia al producto alquilado
 * @property {number} cantidad - Cantidad de unidades del producto
 * @property {number} precio_unitario - Precio por unidad al momento de la transacción
 */
const DetallePedido = DB.define('DetallePedido', {
    /**
     * Identificador único del detalle de pedido
     * @type {DataTypes.INTEGER}
     * @description Clave primaria autoincremental para identificar cada ítem únicamente.
     *              Útil para modificaciones específicas y referencias en auditoría.
     */
    id_detalle: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Referencia al pedido padre
     * @type {DataTypes.INTEGER}
     * @description Clave foránea que referencia la tabla pedido.
     *              Establece la relación de pertenencia del ítem al pedido.
     *              Un pedido puede tener múltiples detalles.
     */
    id_pedido: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'pedido',
            key: 'id_pedido'
        }
    },

    /**
     * Referencia al producto alquilado
     * @type {DataTypes.INTEGER}
     * @description Clave foránea que referencia la tabla producto.
     *              Identifica qué producto específico se está alquilando.
     *              Un producto puede aparecer en múltiples detalles (diferentes pedidos).
     */
    id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'producto',
            key: 'id_producto'
        }
    },

    /**
     * Cantidad de unidades del producto
     * @type {DataTypes.INTEGER}
     * @description Número de unidades del mismo producto incluidas en el pedido.
     *              Permite alquilar múltiples copias del mismo juego.
     */
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    /**
     * Precio unitario al momento de la transacción
     * @type {DataTypes.FLOAT}
     * @description Precio por unidad del producto preservado al momento del pedido.
     *              Mantiene historial de precios independiente de cambios futuros
     *              en el precio del producto. Esencial para auditoría y reportes.
     */
    precio_unitario: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
},
    {
        tableName: 'detalle_pedido',
        timestamps: false
    }
);

/**
 * Exporta el modelo DetallePedido para su uso en controladores, servicios y asociaciones.
 * 
 * @module DetallePedido
 * @description Modelo de tabla intermedia para la relación Pedido-Producto.
 *              Se relaciona con Pedido y Producto mediante associations.js
 */
module.exports = DetallePedido;