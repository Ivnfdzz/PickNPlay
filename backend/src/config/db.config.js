const { Sequelize } = require('sequelize');
require('dotenv').config();


const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false, // Desactiva los logs de SQL
        pool: {
            max: 5, // Máximo de conexiones en el pool
            min: 0, // Mínimo de conexiones en el pool
            acquire: 30000, // Tiempo máximo para adquirir una conexión
            idle: 10000 // Tiempo máximo que una conexión puede estar inactiva antes de ser liberada
        }
    });

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

module.exports = {
    sequelize,
    testConnection
};
