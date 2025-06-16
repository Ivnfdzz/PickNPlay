const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config.js');

const User = sequelize.define('User', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
},
    {
        tableName: 'usuarios', // Nombre específico de la tabla
        timestamps: false // Si no quieres createdAt y updatedAt automáticos
    }
);

module.exports = User;