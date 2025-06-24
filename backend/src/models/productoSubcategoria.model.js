const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

const ProductoSubcategoria = DB.define('ProductoSubcategoria', {
    id_producto_subcategoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'producto',
            key: 'id_producto'
        }
    },
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

module.exports = ProductoSubcategoria;