const Accion = require('../models/accion.model.js');

const crearAcciones = async () => {
    try {
        const accionesExistentes = await Accion.count();
        if (accionesExistentes > 0) {
            console.log('Acciones ya existen, saltando...');
            return;
        }

        await Accion.bulkCreate([
            { nombre: 'crear' },
            { nombre: 'actualizar' },
            { nombre: 'eliminar' },
            { nombre: 'activar' },
            { nombre: 'desactivar' }
        ]);

        console.log('Acciones creadas');
    } catch (error) {
        console.error('Error creando acciones:', error);
    }
};

module.exports = crearAcciones;