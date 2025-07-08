/**
 * @fileoverview Seeder de Roles para el sistema Pick&Play
 * 
 * Inicializa la tabla de roles con los niveles de acceso del sistema
 * de autorización. Define la jerarquía de permisos utilizada para
 * controlar el acceso a funcionalidades administrativas.
 * 
 * Implementa un sistema RBAC (Role-Based Access Control) con tres
 * niveles: root (superadmin), analista (admin) y repositor (básico).
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const Rol = require('../models/rol.model.js');

/**
 * Crea los roles del sistema si no existen
 * 
 * @async
 * @function crearRoles
 * @description Inicializa la tabla rol con la jerarquía de acceso:
 *              - root: Acceso completo al sistema
 *              - analista: Acceso administrativo con restricciones
 *              - repositor: Acceso básico limitado
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error durante la creación
 */
const crearRoles = async () => {
    try {
        const rolesExistentes = await Rol.count();
        if (rolesExistentes > 0) {
            console.log('Roles ya existen, saltando...');
            return;
        }

        await Rol.bulkCreate([
            { nombre: 'root' },
            { nombre: 'analista' },
            { nombre: 'repositor' }
        ]);

        console.log('Roles creados');
    } catch (error) {
        console.error('Error creando roles:', error);
    }
};

/**
 * Exporta la función de seeding para su uso en el script principal.
 * 
 * @module crearRoles
 * @description Función de inicialización de datos para roles de usuario.
 *              Utilizada por el script principal de seeders para poblar la base de datos.
 */
module.exports = crearRoles;