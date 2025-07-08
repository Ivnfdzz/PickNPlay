/**
 * @fileoverview Modelo de Método de Pago para el sistema Pick&Play
 * 
 * Define los métodos de pago disponibles en el autoservicio para procesar
 * las transacciones de alquiler. Permite flexibilidad en la configuración
 * de opciones de pago (efectivo, tarjeta, transferencia, etc.) sin
 * modificar el código de la aplicación.
 * 
 * Cada método puede ser activado/desactivado dinámicamente para adaptarse
 * a las necesidades operativas del negocio.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

/**
 * Modelo Sequelize para la gestión de métodos de pago
 * 
 * @typedef {Object} MetodoPagoAttributes
 * @property {number} id_metodopago - Identificador único del método de pago (clave primaria)
 * @property {string} nombre - Nombre descriptivo del método de pago
 * @property {boolean} activo - Estado de disponibilidad del método de pago
 */
const MetodoPago = DB.define('MetodoPago', {
    /**
     * Identificador único del método de pago
     * @type {DataTypes.INTEGER}
     * @description Clave primaria autoincremental para identificar métodos de pago únicamente.
     *              Se utiliza para referenciar en Pedido y reportes financieros.
     */
    id_metodopago: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Nombre del método de pago
     * @type {DataTypes.STRING}
     * @description Nombre descriptivo único del método (ej: "Efectivo", "Tarjeta", "Transferencia").
     *              Se muestra en la interfaz de selección de pago del cliente.
     *              Incluye validación para evitar nombres vacíos.
     */
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: 'El nombre del método de pago no puede estar vacío'
            }
        }
    },

    /**
     * Estado de disponibilidad del método de pago
     * @type {DataTypes.BOOLEAN}
     * @description Control de disponibilidad sin eliminación física:
     *              - true: Método activo y disponible para selección
     *              - false: Método inactivo (oculto para clientes)
     *              Permite gestión dinámica de opciones de pago según necesidades operativas.
     */
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'metodo_pago',
    timestamps: false
});

/**
 * Exporta el modelo MetodoPago para su uso en controladores, servicios y asociaciones.
 * 
 * @module MetodoPago
 * @description Modelo para la gestión de opciones de pago en el autoservicio.
 *              Se relaciona con Pedido mediante associations.js
 */
module.exports = MetodoPago;