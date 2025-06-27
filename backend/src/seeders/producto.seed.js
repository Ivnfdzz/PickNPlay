const Producto = require('../models/producto.model.js');

const crearProductos = async () => {
    try {
        const productosExistentes = await Producto.count();
        if (productosExistentes > 0) {
            console.log('Productos ya existen, saltando...');
            return;
        }

        await Producto.bulkCreate([
            {
                nombre: 'Monopoly Clásico',
                precio: 4000.00,
                imagen: 'monopoly.jpg',
                descripcion: 'El clásico juego de bienes raíces donde puedes comprar, vender y comerciar propiedades.',
                activo: true
            },
            
            {
                nombre: 'Scrabble',
                precio: 2500.00,
                imagen: 'scrabble.jpg',
                descripcion: 'Juego de palabras cruzadas para toda la familia.',
                activo: true
            },

            {
                nombre: 'Risk',
                precio: 4000.00,
                imagen: 'risk.jpg',
                descripcion: 'Conquista el mundo en este épico juego de estrategia militar.',
                activo: true
            },
            
            {
                nombre: 'UNO',
                precio: 1200.00,
                imagen: 'uno.jpg',
                descripcion: 'El famoso juego de cartas para toda la familia.',
                activo: true
            },
            
            {
                nombre: 'Puzzle 1000 piezas - Paisaje',
                precio: 1800.00,
                imagen: 'puzzle_paisaje.jpg',
                descripcion: 'Hermoso puzzle de 1000 piezas con paisaje montañoso.',
                activo: true
            },
            
            {
                nombre: 'Jenga',
                precio: 5000.00,
                imagen: 'jenga.jpg',
                descripcion: 'Torre de bloques de madera. ¡No la dejes caer!',
                activo: true
            },
            
            {
                nombre: 'Truco Argentino',
                precio: 2800.00,
                imagen: 'truco_argentino.jpg',
                descripcion: 'Juego de cartas tradicional argentino.',
                activo: true
            },
            {
                nombre: 'Poker',
                precio: 2800.00,
                imagen: 'poker.jpg',
                descripcion: 'Juego de cartas tradicional de apuestas.',
                activo: true
            }
        ]);

        console.log('Productos creados');
    } catch (error) {
        console.error('Error creando productos:', error);
    }
};

module.exports = crearProductos;