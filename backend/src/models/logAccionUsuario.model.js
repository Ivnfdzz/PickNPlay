/**
 * @fileoverview Modelo de Log de Acciones de Usuario para el sistema Pick&Play
 * 
 * Implementa el sistema de auditoría y trazabilidad del sistema, registrando
 * todas las acciones significativas realizadas por los usuarios. Cada registro
 * incluye quién realizó la acción, qué acción fue, cuándo ocurrió y
 * opcionalmente sobre qué producto.
 * 
 * Este modelo es fundamental para la seguridad, debugging, cumplimiento
 * normativo y análisis de uso del sistema. Permite rastrear todas las
 * operaciones para identificar patrones, errores o actividades sospechosas.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

/**
 * Modelo Sequelize para el registro de actividades del sistema
 * 
 * @typedef {Object} LogAccionUsuarioAttributes
 * @property {number} id_log - Identificador único del registro de log (clave primaria)
 * @property {number} id_usuario - Referencia al usuario que realizó la acción
 * @property {number} id_accion - Referencia al tipo de acción realizada
 * @property {number|null} id_producto - Referencia al producto afectado (opcional)
 * @property {Date} fecha_hora - Timestamp de cuando ocurrió la acción
 */
const LogAccionUsuario = DB.define('LogAccionUsuario', {
    /**
     * Identificador único del registro de log
     * @type {DataTypes.INTEGER}
     * @description Clave primaria autoincremental para identificar cada registro únicamente.
     *              Permite ordenamiento cronológico y referencias específicas.
     */
    id_log: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Referencia al usuario que realizó la acción
     * @type {DataTypes.INTEGER}
     * @description Clave foránea que referencia la tabla usuarios.
     *              Identifica quién realizó la acción para trazabilidad y responsabilidad.
     *              Esencial para auditorías de seguridad.
     */
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id_usuario'
        }
    },

    /**
     * Referencia al tipo de acción realizada
     * @type {DataTypes.INTEGER}
     * @description Clave foránea que referencia la tabla accion.
     *              Clasifica el tipo de operación realizada (login, crear, editar, etc.)
     *              para análisis y filtrado de logs.
     */
    id_accion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'accion',
            key: 'id_accion'
        }
    },

    /**
     * Referencia al producto afectado (opcional)
     * @type {DataTypes.INTEGER}
     * @description Clave foránea que referencia la tabla producto.
     *              Campo opcional que se completa cuando la acción afecta
     *              a un producto específico (crear, editar, eliminar producto).
     *              Null para acciones generales (login, logout, etc.).
     */
    id_producto: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'producto',
            key: 'id_producto'
        }
    },

    /**
     * Timestamp de la acción
     * @type {DataTypes.DATE}
     * @description Fecha y hora exacta cuando ocurrió la acción.
     *              Se establece automáticamente al crear el registro.
     *              Fundamental para análisis temporal y debugging.
     */
    fecha_hora: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'log_accion_usuario',
    timestamps: false
});

/**
 * Exporta el modelo LogAccionUsuario para su uso en controladores, servicios y asociaciones.
 * 
 * @module LogAccionUsuario
 * @description Modelo central para el sistema de auditoría y trazabilidad.
 *              Se relaciona con Usuario, Accion y Producto mediante associations.js
 */
module.exports = LogAccionUsuario;