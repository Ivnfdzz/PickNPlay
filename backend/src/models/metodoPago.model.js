const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

const MetodoPago = DB.define('MetodoPago', {
    id_metodopago: {
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
                msg: 'El nombre del método de pago no puede estar vacío'
            }
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'metodo_pago',
    timestamps: false
});

module.exports = MetodoPago;