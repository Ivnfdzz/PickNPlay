/**
 * @fileoverview Script Principal de Seeders para el sistema Pick&Play
 * 
 * Orquesta la ejecución de todos los seeders del sistema en el orden
 * correcto respetando las dependencias referenciales entre tablas.
 * Inicializa la base de datos con datos básicos necesarios para el
 * funcionamiento del autoservicio.
 * 
 * Este script es ejecutado durante el despliegue inicial o reset
 * del sistema para poblar las tablas con datos fundamentales:
 * roles, categorías, productos, usuarios administrativos, etc.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const { inicializarDB } = require('../config/db.config.js');
const crearRoles = require('./rol.seed.js');
const crearCategorias = require('./categoria.seed.js');
const crearMetodosPago = require('./metodoPago.seed.js');
const crearProductos = require('./producto.seed.js');
const crearUsuarios = require('./usuario.seed.js');
const crearSubcategorias = require('./subcategoria.seed.js');
const crearAcciones = require('./accion.seed.js');

/**
 * Ejecuta todos los seeders en orden secuencial
 * 
 * @async
 * @function ejecutarSeeds
 * @description Inicializa la base de datos y ejecuta todos los seeders
 *              respetando el orden de dependencias referenciales:
 *              
 *              1. Inicializar DB y relaciones (associations)
 *              2. Roles (base para usuarios)
 *              3. Categorías (base para subcategorías)
 *              4. Subcategorías (base para productos)
 *              5. Acciones (base para auditoría)
 *              6. Métodos de Pago (base para pedidos)
 *              7. Productos (requiere subcategorías)
 *              8. Usuarios (requiere roles)
 *              
 *              Termina el proceso con exit code 0 en éxito o 1 en error.
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error en cualquier seeder
 */
const ejecutarSeeds = async () => {
    try {
        console.log('Iniciando seeds...');
        
        // Inicializar DB y relaciones
        await inicializarDB();
        
        // Ejecutar seeds en orden (respetando dependencias)
        await crearRoles();
        await crearCategorias();
        await crearSubcategorias();
        await crearAcciones();
        await crearMetodosPago();
        await crearProductos();
        await crearUsuarios();
        
        console.log('Seeds ejecutados exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('Error ejecutando seeds:', error);
        process.exit(1);
    }
};

/**
 * Ejecuta el script de seeders
 * 
 * @description Punto de entrada del script que inicia la ejecución
 *              de todos los seeders del sistema.
 */
ejecutarSeeds();