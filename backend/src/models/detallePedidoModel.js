const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config.js');

const DetallePedido = sequelize.define('DetallePedido', {
    id_detalle: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_pedido: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'pedido',
            key: 'id_pedido'
        }
    },
    id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'producto', // Nombre de la tabla referenciada
            key: 'id_producto' // Clave primaria de la tabla referenciada
        }
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    precio_unitario: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
},
    {
        tableName: 'detalle_pedido',
        timestamps: false
    }
);

module.exports = DetallePedido;