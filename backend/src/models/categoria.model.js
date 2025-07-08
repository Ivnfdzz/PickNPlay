/**
 * @fileoverview Modelo de Categoría para el sistema Pick&Play
 * 
 * Define las categorías principales de productos disponibles en el autoservicio.
 * Las categorías son la clasificación de primer nivel para organizar los juegos
 * (ej: "Juegos de Mesa", "Juegos de Cartas") y facilitar la navegación del cliente.
 * 
 * Cada categoría puede contener múltiples subcategorías y productos, proporcionando
 * una estructura jerárquica clara para el catálogo de juegos.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

/**
 * Modelo Sequelize para la gestión de categorías de productos
 * 
 * @typedef {Object} CategoriaAttributes
 * @property {number} id_categoria - Identificador único de la categoría (clave primaria)
 * @property {string} nombre - Nombre único de la categoría
 */
const Categoria = DB.define('Categoria', {
    /**
     * Identificador único de la categoría
     * @type {DataTypes.INTEGER}
     * @description Clave primaria autoincremental para identificar categorías únicamente.
     *              Se utiliza para referenciar en Producto y Subcategoria.
     */
    id_categoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Nombre de la categoría
     * @type {DataTypes.STRING}
     * @description Nombre descriptivo único de la categoría (ej: "Juegos de Mesa", "Juegos de Cartas").
     *              Se muestra en la interfaz de navegación del cliente.
     *              Debe ser único para evitar duplicados en la clasificación.
     */
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
},
    {
        tableName: 'categoria',
        timestamps: false
    }
);

/**
 * Exporta el modelo Categoria para su uso en controladores, servicios y asociaciones.
 * 
 * @module Categoria
 * @description Modelo base para la clasificación jerárquica de productos.
 *              Se relaciona con Producto y Subcategoria mediante associations.js
 */
module.exports = Categoria;