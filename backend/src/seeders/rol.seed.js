const Rol = require('../models/rol.model.js');

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

module.exports = crearRoles;