/**
 * @fileoverview Seeder de Acciones para el sistema Pick&Play
 * 
 * Inicializa la tabla de acciones con los tipos de operaciones auditables
 * básicas del sistema. Estas acciones son utilizadas por el sistema de
 * auditoría para clasificar y registrar las actividades de los usuarios.
 * 
 * Las acciones definidas aquí deben corresponder con las operaciones
 * implementadas en los controladores y servicios del sistema.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const Accion = require('../models/accion.model.js');

/**
 * Crea las acciones básicas del sistema si no existen
 * 
 * @async
 * @function crearAcciones
 * @description Inicializa la tabla accion con los tipos de operaciones
 *              fundamentales: Crear, Actualizar, Eliminar. Verifica si
 *              ya existen registros para evitar duplicados.
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error durante la creación
 */
const crearAcciones = async () => {
    try {
        const accionesExistentes = await Accion.count();
        if (accionesExistentes > 0) {
            console.log('Acciones ya existen, saltando...');
            return;
        }

        await Accion.bulkCreate([
            { nombre: 'Crear' },
            { nombre: 'Actualizar' },
            { nombre: 'Eliminar' }
        ]);

        console.log('Acciones creadas');
    } catch (error) {
        console.error('Error creando acciones:', error);
    }
};

/**
 * Exporta la función de seeding para su uso en el script principal.
 * 
 * @module crearAcciones
 * @description Función de inicialización de datos para acciones auditables.
 *              Utilizada por el script principal de seeders para poblar la base de datos.
 */
module.exports = crearAcciones;