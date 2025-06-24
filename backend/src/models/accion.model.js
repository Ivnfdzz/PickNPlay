const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

const Accion = DB.define('Accion', {
    id_accion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
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

module.exports = Accion;