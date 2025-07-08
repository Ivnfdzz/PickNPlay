/**
 * Módulo de Configuración de Base de Datos
 * 
 * Este módulo configura e inicializa la conexión a la base de datos para la aplicación
 * de comercio electrónico Pick&Play. Establece una conexión MySQL usando Sequelize ORM
 * con pooling de conexiones optimizado y proporciona funciones de inicialización.
 * 
 * La configuración incluye:
 * - Parámetros de conexión basados en variables de entorno
 * - Pool de conexiones para optimización de rendimiento
 * - Sincronización de base de datos y establecimiento de relaciones
 * 
 * @module db.config
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Instancia de base de datos Sequelize configurada para MySQL
 * 
 * Establece conexión a la base de datos MySQL usando variables de entorno
 * por seguridad. La configuración incluye ajustes optimizados del pool para
 * manejar conexiones concurrentes en el entorno de comercio electrónico.
 * 
 * Justificación de la configuración del pool:
 * - max: 5 conexiones para tráfico pequeño a mediano
 * - acquire: timeout de 30s previene conexiones colgadas
 * - idle: limpieza de 10s para gestión eficiente de recursos
 * 
 * @type {Sequelize}
 */
const DB = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

/**
 * Prueba la conexión a la base de datos
 * 
 * Verifica que la base de datos sea accesible y esté configurada correctamente.
 * Esta función se llama durante el inicio de la aplicación para asegurar
 * la conectividad de la base de datos antes de proceder con la inicialización.
 * 
 * @async
 * @function testConnection
 * @returns {Promise<void>}
 * @throws {Error} Cuando falla la conexión a la base de datos
 */
const testConnection = async () => {
    try {
        await DB.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

/**
 * Inicializa la base de datos con modelos y relaciones
 * 
 * Realiza la inicialización completa de la base de datos incluyendo:
 * 1. Prueba de conexión
 * 2. Establecimiento de asociaciones de modelos
 * 3. Sincronización de la base de datos
 * 
 * Esta función debe ser llamada una vez durante el inicio de la aplicación
 * para asegurar que todos los modelos y relaciones de la base de datos estén
 * configurados correctamente antes de manejar peticiones.
 * 
 * @async
 * @function inicializarDB
 * @returns {Promise<void>}
 * @throws {Error} Cuando falla la inicialización de la base de datos
 */
const inicializarDB = async () => {
    await testConnection();
    
    const establecerRelaciones = require('../models/associations.js');
    establecerRelaciones();

    await DB.sync();
    console.log('Base de datos sincronizada correctamente.');
};

/**
 * Exportaciones de configuración de base de datos
 * 
 * @exports DB - Instancia de Sequelize configurada para operaciones de base de datos
 * @exports inicializarDB - Función de inicialización de la base de datos
 */
module.exports = {
    DB,
    inicializarDB
};