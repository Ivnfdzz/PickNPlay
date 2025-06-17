const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config.js');

const Venta = sequelize.define('Venta', {
    id_venta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_pedido: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'pedido', // Nombre de la tabla referenciada
            key: 'id_pedido' // Clave primaria de la tabla referenciada
        }
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    metodo_pago: {
        type: DataTypes.ENUM,
        values: ['efectivo', 'tarjeta', 'qr'],
        allowNull: false
    }
},
    {
        tableName: 'venta', // Nombre específico de la tabla
        timestamps: false // Si no quieres createdAt y updatedAt automáticos
    }
);

module.exports = Venta;