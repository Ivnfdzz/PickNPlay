const Categoria = require('../models/categoria.model.js');

const crearCategorias = async () => {
    try {
        const categoriasExistentes = await Categoria.count();
        if (categoriasExistentes > 0) {
            console.log('Categorías ya existen, saltando...');
            return;
        }

        await Categoria.bulkCreate([
            { nombre: 'Juegos de Cartas' },
            { nombre: 'Juegos de Mesa' }
        ]);

        console.log('Categorías creadas');
    } catch (error) {
        console.error('Error creando categorías:', error);
    }
};

module.exports = crearCategorias;