/**
 * @fileoverview Seeder de Categorías para el sistema Pick&Play
 * 
 * Inicializa la tabla de categorías con las clasificaciones principales
 * de productos del autoservicio. Define la estructura de primer nivel
 * para organizar el catálogo de juegos disponibles para alquiler.
 * 
 * Las categorías establecen la base de la jerarquía de navegación
 * (Categoría > Subcategoría > Producto) utilizada en el frontend.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const Categoria = require('../models/categoria.model.js');

/**
 * Crea las categorías principales del sistema si no existen
 * 
 * @async
 * @function crearCategorias
 * @description Inicializa la tabla categoria con las clasificaciones
 *              principales: "Juegos de Mesa" y "Juegos de Cartas".
 *              Verifica si ya existen registros para evitar duplicados.
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error durante la creación
 */
const crearCategorias = async () => {
    try {
        const categoriasExistentes = await Categoria.count();
        if (categoriasExistentes > 0) {
            console.log('Categorías ya existen, saltando...');
            return;
        }

        await Categoria.bulkCreate([
            { nombre: 'Juegos de Mesa' },
            { nombre: 'Juegos de Cartas' }
        ]);

        console.log('Categorías creadas');
    } catch (error) {
        console.error('Error creando categorías:', error);
    }
};

/**
 * Exporta la función de seeding para su uso en el script principal.
 * 
 * @module crearCategorias
 * @description Función de inicialización de datos para categorías de productos.
 *              Utilizada por el script principal de seeders para poblar la base de datos.
 */
module.exports = crearCategorias;