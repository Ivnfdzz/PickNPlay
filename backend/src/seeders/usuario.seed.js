const Usuario = require('../models/usuario.model.js');

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

        console.log('Usuarios creados');
    } catch (error) {
        console.error('Error creando usuarios:', error);
    }
};

module.exports = crearUsuarios;