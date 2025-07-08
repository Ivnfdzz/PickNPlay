/**
 * @fileoverview Modelo de Subcategoría para el sistema Pick&Play
 * 
 * Define las subcategorías que refinan la clasificación de productos dentro
 * de cada categoría principal. Las subcategorías proporcionan una navegación
 * más granular para los clientes (ej: dentro de "Juegos de Mesa" puede haber
 * "Estrategia", "Familiares", "Cooperativos", etc.).
 * 
 * Cada subcategoría pertenece obligatoriamente a una categoría padre y puede
 * ser asociada a múltiples productos mediante la tabla intermedia ProductoSubcategoria.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

/**
 * Modelo Sequelize para la gestión de subcategorías de productos
 * 
 * @typedef {Object} SubcategoriaAttributes
 * @property {number} id_subcategoria - Identificador único de la subcategoría (clave primaria)
 * @property {string} nombre - Nombre descriptivo de la subcategoría
 * @property {number} id_categoria - Referencia a la categoría padre
 */
const Subcategoria = DB.define('Subcategoria', {
    /**
     * Identificador único de la subcategoría
     * @type {DataTypes.INTEGER}
     * @description Clave primaria autoincremental para identificar subcategorías únicamente.
     *              Se utiliza para referenciar en ProductoSubcategoria.
     */
    id_subcategoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Nombre de la subcategoría
     * @type {DataTypes.STRING}
     * @description Nombre descriptivo de la subcategoría (ej: "Estrategia", "Familiares").
     *              Incluye validación personalizada para evitar nombres vacíos.
     */
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre de la subcategoría no puede estar vacío'
            }
        }
    },

    /**
     * Referencia a la categoría padre
     * @type {DataTypes.INTEGER}
     * @description Clave foránea que referencia la tabla categoria.
     *              Establece la relación jerárquica categoría > subcategoría.
     *              Una subcategoría pertenece a una sola categoría.
     */
    id_categoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categoria',
            key: 'id_categoria'
        }
    }
}, {
    tableName: 'subcategoria',
    timestamps: false
});

/**
 * Exporta el modelo Subcategoria para su uso en controladores, servicios y asociaciones.
 * 
 * @module Subcategoria
 * @description Modelo para la clasificación de segundo nivel de productos.
 *              Se relaciona con Categoria (padre) y Producto (mediante ProductoSubcategoria).
 */
module.exports = Subcategoria;