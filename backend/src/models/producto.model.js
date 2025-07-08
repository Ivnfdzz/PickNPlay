/**
 * @fileoverview Modelo de Producto para el sistema Pick&Play
 * 
 * Define la estructura y propiedades de los productos (juegos de mesa y cartas)
 * disponibles para alquiler en el autoservicio. Los productos se organizan por
 * categorías (Juegos de Mesa, Juegos de Cartas) y pueden pertenecer a múltiples
 * subcategorías para facilitar la navegación del cliente.
 * 
 * Cada producto tiene un estado activo/inactivo para controlar su disponibilidad
 * sin necesidad de eliminarlo de la base de datos.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

/**
 * Modelo Sequelize para la gestión de productos en el sistema Pick&Play
 * 
 * @typedef {Object} ProductoAttributes
 * @property {number} id_producto - Identificador único del producto (clave primaria)
 * @property {string} nombre - Nombre único del juego (ej: "Ajedrez", "UNO")
 * @property {number} precio - Precio de alquiler por sesión/día
 * @property {string} imagen - Ruta al archivo de imagen del producto
 * @property {string} descripcion - Descripción detallada del juego (opcional)
 * @property {boolean} activo - Estado del producto (true: disponible, false: inactivo)
 */
const Producto = DB.define('Producto', {
    /**
     * Identificador único del producto
     * @type {DataTypes.INTEGER}
     * @description Clave primaria autoincremental para identificar productos únicamente
     */
    id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    /**
     * Nombre del producto/juego
     * @type {DataTypes.STRING}
     * @description Nombre único del juego, utilizado para búsquedas y display.
     *              Debe ser único para evitar duplicados en el inventario.
     */
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    /**
     * Precio de alquiler
     * @type {DataTypes.FLOAT}
     * @description Precio en moneda local por sesión/día de alquiler.
     *              Se utiliza para calcular el total del pedido.
     */
    precio: {
        type: DataTypes.FLOAT,
        allowNull: false
    },

    /**
     * Ruta de la imagen del producto
     * @type {DataTypes.STRING}
     * @description Nombre del archivo de imagen almacenado en backend/src/img/productos/.
     *              Se concatena con la URL base para mostrar en el frontend.
     */
    imagen: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /**
     * Descripción detallada del producto
     * @type {DataTypes.TEXT}
     * @description Información adicional sobre el juego (reglas, duración, jugadores).
     *              Campo opcional para productos que requieren más contexto.
     */
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    /**
     * Estado de disponibilidad del producto
     * @type {DataTypes.BOOLEAN}
     * @description Control de disponibilidad sin eliminación física:
     *              - true: Producto activo y disponible para alquiler
     *              - false: Producto inactivo (oculto para clientes)
     *              Permite gestión de inventario sin pérdida de datos históricos.
     */
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
},
    {
        tableName: 'producto',
        timestamps: false
    }
);

/**
 * Exporta el modelo Producto para su uso en controladores, servicios y asociaciones.
 * 
 * @module Producto
 * @description Modelo base para la gestión de productos en el sistema de alquiler.
 *              Se relaciona con Categoria, Subcategoria y DetallePedido mediante associations.js
 */
module.exports = Producto;