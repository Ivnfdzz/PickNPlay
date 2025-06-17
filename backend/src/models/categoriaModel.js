const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config.js');

const Categoria = sequelize.define('Categoria', {
    id_categoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
},
    {
        tableName: 'categoria', // Nombre específico de la tabla
        timestamps: false // Si no quieres createdAt y updatedAt automáticos
    }
);

module.exports = Categoria;