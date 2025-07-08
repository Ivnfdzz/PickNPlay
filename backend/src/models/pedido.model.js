/**
 * @fileoverview Modelo de Pedido para el sistema Pick&Play
 * 
 * Representa las transacciones de alquiler de juegos realizadas por los clientes
 * en el sistema de autoservicio. Cada pedido contiene la información básica de
 * la transacción (cliente, fecha, total, método de pago) y se relaciona con
 * los productos alquilados a través de DetallePedido.
 * 
 * Los pedidos actúan como comprobante de la transacción y permiten el seguimiento
 * de las ventas, estadísticas y auditoría del sistema.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

/**
 * Modelo Sequelize para la gestión de pedidos/órdenes de alquiler
 * 
 * @typedef {Object} PedidoAttributes
 * @property {number} id_pedido - Identificador único del pedido (clave primaria)
 * @property {Date} fecha - Timestamp de creación del pedido
 * @property {string} nombre_cliente - Nombre del cliente que realiza el pedido
 * @property {number} total - Monto total del pedido (suma de productos alquilados)
 * @property {number} id_metodopago - Referencia al método de pago utilizado
 */
const Pedido = DB.define('Pedido', {
    /**
     * Identificador único del pedido
     * @type {DataTypes.INTEGER}
     * @description Clave primaria autoincremental para identificar pedidos únicamente.
     *              Se utiliza para referenciar el pedido en DetallePedido y reportes.
     */
    id_pedido: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Fecha y hora de creación del pedido
     * @type {DataTypes.DATE}
     * @description Timestamp automático al momento de crear el pedido.
     *              Se utiliza para reportes, estadísticas y auditoría.
     */
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    /**
     * Nombre del cliente
     * @type {DataTypes.STRING}
     * @description Nombre proporcionado por el cliente para identificar el pedido.
     *              No se requiere registro previo, permite uso anónimo del autoservicio.
     */
    nombre_cliente: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /**
     * Monto total del pedido
     * @type {DataTypes.FLOAT}
     * @description Suma total de todos los productos alquilados en el pedido.
     *              Se calcula automáticamente basado en los DetallePedido asociados.
     */
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },

    /**
     * Referencia al método de pago utilizado
     * @type {DataTypes.INTEGER}
     * @description Clave foránea que referencia la tabla metodo_pago.
     *              Permite rastrear estadísticas de métodos de pago preferidos.
     */
    id_metodopago: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'metodo_pago',
            key: 'id_metodopago'
        }
    }
},
    {
        tableName: 'pedido',
        timestamps: false
    }
);

/**
 * Exporta el modelo Pedido para su uso en controladores, servicios y asociaciones.
 * 
 * @module Pedido
 * @description Modelo central para transacciones de alquiler en el autoservicio.
 *              Se relaciona con DetallePedido, MetodoPago y indirectamente con Producto.
 */
module.exports = Pedido;