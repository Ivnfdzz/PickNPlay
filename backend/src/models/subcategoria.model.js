const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

const Subcategoria = DB.define('Subcategoria', {
    id_subcategoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre de la subcategoría no puede estar vacío'
            }
        }
    },
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

module.exports = Subcategoria;