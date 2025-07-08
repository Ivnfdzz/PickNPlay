/**
 * @fileoverview Seeder de Métodos de Pago para el sistema Pick&Play
 * 
 * Inicializa la tabla de métodos de pago con las opciones disponibles
 * para procesar transacciones en el autoservicio. Incluye métodos
 * tradicionales y digitales con configuración de estado activo/inactivo.
 * 
 * La configuración permite habilitar/deshabilitar métodos según
 * disponibilidad operativa sin modificar el código del sistema.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const MetodoPago = require('../models/metodoPago.model.js');

/**
 * Crea los métodos de pago del sistema si no existen
 * 
 * @async
 * @function crearMetodosPago
 * @description Inicializa la tabla metodo_pago con opciones tradicionales
 *              y digitales. Algunos métodos se crean desactivados (Modo, QR)
 *              para futuras implementaciones o configuración específica.
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error durante la creación
 */
const crearMetodosPago = async () => {
    try {
        const metodosExistentes = await MetodoPago.count();
        if (metodosExistentes > 0) {
            console.log('Métodos de pago ya existen, saltando...');
            return;
        }

        await MetodoPago.bulkCreate([
            { nombre: 'Efectivo', activo: true },
            { nombre: 'Tarjeta de Débito', activo: true },
            { nombre: 'Tarjeta de Crédito', activo: true },
            { nombre: 'Transferencia Bancaria', activo: true },
            { nombre: 'MercadoPago', activo: true },
            { nombre: 'Modo', activo: false },
            { nombre: 'PayPal', activo: true },
            { nombre: 'QR', activo: false }
        ]);

        console.log('Métodos de pago creados');
    } catch (error) {
        console.error('Error creando métodos de pago:', error);
    }
};

/**
 * Exporta la función de seeding para su uso en el script principal.
 * 
 * @module crearMetodosPago
 * @description Función de inicialización de datos para métodos de pago.
 *              Utilizada por el script principal de seeders para poblar la base de datos.
 */
module.exports = crearMetodosPago;