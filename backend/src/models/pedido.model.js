const { DataTypes } = require('sequelize');
const { DB } = require('../config/db.config.js');

const Pedido = DB.define('Pedido', {
    id_pedido: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    nombre_cliente: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    id_metodopago: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'metodo_pago',
            key: 'id_metodopago'
        }
    }
},
    {
        tableName: 'pedido', // Nombre específico de la tabla
        timestamps: false // Si no quieres createdAt y updatedAt automáticos
    }
);

module.exports = Pedido;