const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

const LogAccionUsuario = DB.define('LogAccionUsuario', {
    id_log: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id_usuario'
        }
    },
    id_accion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'accion',
            key: 'id_accion'
        }
    },
    id_producto: {
        type: DataTypes.INTEGER,
        allowNull: true, // Puede ser null si la acción no está relacionada con un producto específico
        references: {
            model: 'producto',
            key: 'id_producto'
        }
    },
    fecha_hora: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'log_accion_usuario',
    timestamps: false
});

module.exports = LogAccionUsuario;