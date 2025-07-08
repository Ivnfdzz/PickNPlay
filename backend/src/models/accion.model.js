/**
 * @fileoverview Modelo de Acción para el sistema de auditoría Pick&Play
 * 
 * Define los tipos de acciones que pueden ser registradas en el sistema
 * de auditoría para el seguimiento de actividades de usuarios. Las acciones
 * representan operaciones específicas que se pueden realizar en el sistema
 * (ej: "login", "logout", "crear_producto", "eliminar_usuario", etc.).
 * 
 * Este modelo forma parte del sistema de trazabilidad y seguridad,
 * permitiendo un registro detallado de todas las operaciones realizadas
 * por los usuarios del sistema.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

/**
 * Modelo Sequelize para la gestión de tipos de acciones auditables
 * 
 * @typedef {Object} AccionAttributes
 * @property {number} id_accion - Identificador único de la acción (clave primaria)
 * @property {string} nombre - Nombre único descriptivo de la acción
 */
const Accion = DB.define('Accion', {
    /**
     * Identificador único de la acción
     * @type {DataTypes.INTEGER}
     * @description Clave primaria autoincremental para identificar acciones únicamente.
     *              Se utiliza para referenciar en LogAccionUsuario y sistemas de auditoría.
     */
    id_accion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Nombre de la acción
     * @type {DataTypes.STRING}
     * @description Nombre único descriptivo de la acción (ej: "login", "crear_producto").
     *              Se utiliza en el sistema de auditoría para clasificar y filtrar
     *              los registros de actividad por tipo de operación.
     *              Incluye validación para evitar nombres vacíos.
     */
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: 'El nombre de la acción no puede estar vacío'
            }
        }
    }
}, {
    tableName: 'accion',
    timestamps: false
});

/**
 * Exporta el modelo Accion para su uso en controladores, servicios y asociaciones.
 * 
 * @module Accion
 * @description Modelo catálogo para el sistema de auditoría y trazabilidad.
 *              Se relaciona con LogAccionUsuario mediante associations.js
 */
module.exports = Accion;