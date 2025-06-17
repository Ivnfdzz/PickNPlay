const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config.js');

const Producto = sequelize.define('Producto', {
    id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    precio: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    id_categoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categoria', // Nombre de la tabla referenciada
            key: 'id_categoria' // Clave primaria de la tabla referenciada
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
},
    {
        tableName: 'producto', // Nombre específico de la tabla
        timestamps: false // Si no quieres createdAt y updatedAt automáticos
    }
);

module.exports = Producto;