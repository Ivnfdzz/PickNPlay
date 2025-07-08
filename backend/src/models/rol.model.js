/**
 * @fileoverview Modelo de Rol para el sistema Pick&Play
 * 
 * Define los roles de usuario disponibles en el sistema para controlar accesos
 * y permisos. Los roles implementan un sistema de autorización basado en roles
 * (RBAC - Role-Based Access Control) para diferenciar entre usuarios regulares
 * y administradores.
 * 
 * Típicamente incluye roles como "admin" (acceso completo al dashboard) y 
 * "usuario" (acceso limitado a funciones básicas).
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config');

/**
 * Modelo Sequelize para la gestión de roles de usuario
 * 
 * @typedef {Object} RolAttributes
 * @property {number} id_rol - Identificador único del rol (clave primaria)
 * @property {string} nombre - Nombre único del rol
 */
const Rol = DB.define('Rol', {
    /**
     * Identificador único del rol
     * @type {DataTypes.INTEGER}
     * @description Clave primaria autoincremental para identificar roles únicamente.
     *              Se utiliza para referenciar en Usuario y sistemas de autorización.
     */
    id_rol: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Nombre del rol
     * @type {DataTypes.STRING}
     * @description Nombre único del rol (ej: "admin", "usuario").
     *              Se utiliza en el sistema de autenticación y autorización
     *              para determinar permisos y acceso a funcionalidades.
     */
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
},
    {
        tableName: 'rol',
        timestamps: false
    }
);

/**
 * Exporta el modelo Rol para su uso en controladores, servicios y asociaciones.
 * 
 * @module Rol
 * @description Modelo base para el sistema de autorización y control de acceso.
 *              Se relaciona con Usuario mediante associations.js
 */
module.exports = Rol;