/**
 * @fileoverview Modelo de Producto-Subcategoría para el sistema Pick&Play
 * 
 * Implementa la tabla intermedia para la relación many-to-many entre
 * Producto y Subcategoria. Permite que un producto pueda pertenecer
 * a múltiples subcategorías y que una subcategoría contenga múltiples
 * productos, proporcionando flexibilidad en la clasificación.
 * 
 * Esta estructura permite una navegación más rica para los clientes,
 * donde un juego puede aparecer en múltiples filtros de búsqueda
 * (ej: "Ajedrez" puede estar en "Estrategia" y "Clásicos").
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

/**
 * Modelo Sequelize para la relación many-to-many entre Producto y Subcategoria
 * 
 * @typedef {Object} ProductoSubcategoriaAttributes
 * @property {number} id_producto_subcategoria - Identificador único de la relación (clave primaria)
 * @property {number} id_producto - Referencia al producto
 * @property {number} id_subcategoria - Referencia a la subcategoría
 */
const ProductoSubcategoria = DB.define('ProductoSubcategoria', {
    /**
     * Identificador único de la relación producto-subcategoría
     * @type {DataTypes.INTEGER}
     * @description Clave primaria autoincremental para identificar cada asociación únicamente.
     *              Facilita modificaciones específicas de las relaciones.
     */
    id_producto_subcategoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Referencia al producto
     * @type {DataTypes.INTEGER}
     * @description Clave foránea que referencia la tabla producto.
     *              Identifica qué producto se está asociando a la subcategoría.
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
     * Referencia a la subcategoría
     * @type {DataTypes.INTEGER}
     * @description Clave foránea que referencia la tabla subcategoria.
     *              Identifica a qué subcategoría se está asociando el producto.
     *              Permite clasificación múltiple para navegación flexible.
     */
    id_subcategoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'subcategoria',
            key: 'id_subcategoria'
        }
    }
}, {
    tableName: 'producto_subcategoria',
    timestamps: false
});

/**
 * Exporta el modelo ProductoSubcategoria para su uso en controladores, servicios y asociaciones.
 * 
 * @module ProductoSubcategoria
 * @description Modelo de tabla intermedia para la relación many-to-many Producto-Subcategoria.
 *              Se relaciona con Producto y Subcategoria mediante associations.js
 */
module.exports = ProductoSubcategoria;