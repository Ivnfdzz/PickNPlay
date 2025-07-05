const ProductoService = require("../services/producto.service.js");

const crearProductos = async () => {
    try {
        const productosExistentes =
            await require("../models/producto.model.js").count();
        if (productosExistentes > 0) {
            console.log("Productos ya existen, saltando...");
            return;
        }

        const productos = [
            {
                nombre: "Monopoly Clásico",
                precio: 4000.0,
                imagen: "monopoly.jpg",
                descripcion:
                    "El clásico juego de bienes raíces donde puedes comprar, vender y comerciar propiedades.",
                subcategorias: [1, 2], // Estrategia + Familiar
            },

            {
                nombre: "Scrabble",
                precio: 2500.0,
                imagen: "scrabble.jpg",
                descripcion: "Juego de palabras cruzadas para toda la familia.",
                subcategorias: [2], // Familiar
            },

            {
                nombre: "Risk",
                precio: 4000.0,
                imagen: "risk.jpg",
                descripcion:
                    "Conquista el mundo en este épico juego de estrategia militar.",
                subcategorias: [1], // Estrategia
            },

            {
                nombre: "UNO",
                precio: 1200.0,
                imagen: "uno.jpg",
                descripcion: "El famoso juego de cartas para toda la familia.",
                subcategorias: [9], // Rápidos
            },

            {
                nombre: "Puzzle 1000 piezas - Paisaje",
                precio: 1800.0,
                imagen: "puzzle_paisaje.jpg",
                descripcion:
                    "Hermoso puzzle de 1000 piezas con paisaje montañoso.",
                subcategorias: [2, 4], // Familiar
            },

            {
                nombre: "Jenga",
                precio: 5000.0,
                imagen: "jenga.jpg",
                descripcion: "Torre de bloques de madera. ¡No la dejes caer!",
                subcategorias: [2, 3], // Familiar + Party Games
            },

            {
                nombre: "Baraja española",
                precio: 2800.0,
                imagen: "baraja_espanola.jpg",
                descripcion: "Juego de cartas tradicional español.",
                subcategorias: [5, 6], // Truco
            },

            {
                nombre: "Baraja francesa",
                precio: 2800.0,
                imagen: "baraja_francesa.jpg",
                descripcion: "Juego de cartas tradicional de apuestas.",
                subcategorias: [7, 8], // Poker
            },
        ];

        for (const productoData of productos) {
            await ProductoService.crear(productoData);
        }

        console.log("Productos con subcategorías creados");
    } catch (error) {
        console.error("Error creando productos:", error);
    }
};

module.exports = crearProductos;
