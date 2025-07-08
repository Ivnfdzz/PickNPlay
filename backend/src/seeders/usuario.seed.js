/**
 * @fileoverview Seeder de Usuarios para el sistema Pick&Play
 * 
 * Inicializa la tabla de usuarios con cuentas administrativas predefinidas
 * para cada nivel de acceso del sistema. Proporciona usuarios de prueba
 * y administración inicial para el funcionamiento del sistema.
 * 
 * Crea usuarios con contraseñas seguras para cada rol: root (superadmin),
 * analista (admin) y repositor (básico), facilitando el acceso inicial
 * al dashboard administrativo.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const Usuario = require('../models/usuario.model.js');

/**
 * Crea los usuarios administrativos del sistema si no existen
 * 
 * @async
 * @function crearUsuarios
 * @description Inicializa la tabla usuarios con cuentas administrativas:
 *              
 *              Usuarios root (id_rol: 1):
 *              - root1@pickandplay.com / root2@pickandplay.com
 *              
 *              Usuario analista (id_rol: 2):
 *              - analista1@pickandplay.com
 *              
 *              Usuario repositor (id_rol: 3):
 *              - repositor1@pickandplay.com
 *              
 *              Las contraseñas se encriptan automáticamente mediante
 *              el hook beforeCreate del modelo Usuario.
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error durante la creación
 */
const crearUsuarios = async () => {
    try {
        const usuariosExistentes = await Usuario.count();
        if (usuariosExistentes > 0) {
            console.log('Usuarios ya existen, saltando...');
            return;
        }

        await Usuario.create({
            username: 'root1',
            email: 'root1@pickandplay.com',
            password: 'rootAdmin123',
            id_rol: 1
        });

        await Usuario.create({
            username: 'root2',
            email: 'root2@pickandplay.com',
            password: 'rootAdmin123',
            id_rol: 1
        });

        await Usuario.create({
            username: 'analista1',
            email: 'analista1@pickandplay.com',
            password: 'analistaAdmin123',
            id_rol: 2
        });

        await Usuario.create({
            username: 'repositor1',
            email: 'repositor1@pickandplay.com',
            password: 'repositorAdmin123',
            id_rol: 3
        });

        await Usuario.create({
            username: 'Profesor1',
            email: 'profesor1@pickandplay.com',
            password: 'profesorAdmin123',
            id_rol: 1
        });

        console.log('Usuarios creados');
    } catch (error) {
        console.error('Error creando usuarios:', error);
    }
};

/**
 * Exporta la función de seeding para su uso en el script principal.
 * 
 * @module crearUsuarios
 * @description Función de inicialización de datos para usuarios administrativos.
 *              Utilizada por el script principal de seeders para poblar la base de datos.
 */
module.exports = crearUsuarios;