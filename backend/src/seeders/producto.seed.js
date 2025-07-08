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
                subcategorias: [1, 2], // Estrategia, Familiar
            },
            {
                nombre: "Scrabble",
                precio: 2500.0,
                imagen: "scrabble.jpg",
                descripcion: "Juego de palabras cruzadas para toda la familia.",
                subcategorias: [3, 2], // Fichas, Familiar
            },
            {
                nombre: "Risk",
                precio: 4000.0,
                imagen: "risk.jpg",
                descripcion:
                    "Conquista el mundo en este épico juego de estrategia militar.",
                subcategorias: [1, 4], // Estrategia, Tablero
            },
            {
                nombre: "Jenga",
                precio: 5000.0,
                imagen: "jenga.jpg",
                descripcion: "Torre de bloques de madera. ¡No la dejes caer!",
                subcategorias: [2], // Familiar
            },
            {
                nombre: "Cluedo",
                precio: 3500.0,
                imagen: "cluedo.jpg",
                descripcion:
                    "Resuelve el misterio en la mansión con lógica y deducción.",
                subcategorias: [5, 4], // Misterio, Tablero
            },
            {
                nombre: "Generala",
                precio: 1800.0,
                imagen: "generala.jpg",
                descripcion: "Juego de dados clásico para toda la familia.",
                subcategorias: [6, 7], // Dados, Puntos
            },
            {
                nombre: "Batalla naval",
                precio: 2200.0,
                imagen: "batalla_naval.jpg",
                descripcion:
                    "Hundí los barcos de tu oponente en este clásico de tablero.",
                subcategorias: [3, 4, 8], // Fichas, Tablero, Uno contra uno
            },
            {
                nombre: "Parchís",
                precio: 2000.0,
                imagen: "parchis.jpg",
                descripcion: "Avanza tus fichas y llega primero a la meta.",
                subcategorias: [3, 4, 2], // Fichas, Tablero, Familiar
            },
            {
                nombre: "Ajedrez",
                precio: 3000.0,
                imagen: "ajedrez.jpg",
                descripcion: "El juego de estrategia y lógica por excelencia.",
                subcategorias: [9, 4, 8], // Logica, Tablero, Uno contra uno
            },
            {
                nombre: "Dominó",
                precio: 1500.0,
                imagen: "domino.jpg",
                descripcion:
                    "Coloca tus fichas y sé el primero en quedarte sin piezas.",
                subcategorias: [3, 8], // Fichas, Uno contra uno
            },
            //CARTAS
            {
                nombre: "Truco",
                precio: 1200.0,
                imagen: "truco.jpg",
                descripcion: "El clásico juego de cartas argentino.",
                subcategorias: [10, 12, 13], // Baraja española, Tradicional, Clasico
            },
            {
                nombre: "Chin chon",
                precio: 1200.0,
                imagen: "chin_chon.jpg",
                descripcion: "Juego tradicional de cartas con baraja española.",
                subcategorias: [10, 12, 13], // Baraja española, Tradicional, Clasico
            },
            {
                nombre: "Poker",
                precio: 1500.0,
                imagen: "poker.jpg",
                descripcion: "El juego de apuestas más famoso del mundo.",
                subcategorias: [11, 13], // Baraja francesa, Clasico
            },
            {
                nombre: "Blackjack",
                precio: 1500.0,
                imagen: "blackjack.jpg",
                descripcion: "Consigue 21 y vence a la banca.",
                subcategorias: [11, 13], // Baraja francesa, Clasico
            },
            {
                nombre: "UNO",
                precio: 1200.0,
                imagen: "uno.jpg",
                descripcion: "El famoso juego de cartas para toda la familia.",
                subcategorias: [15, 14], // Rápidos, Party Games
            },
            {
                nombre: "HDP",
                precio: 2500.0,
                imagen: "hdp.jpg",
                descripcion:
                    "Juego de cartas para adultos, humor negro y risas aseguradas.",
                subcategorias: [16, 14], // Graciosos, Party Games
            },
            {
                nombre: "DOS",
                precio: 1200.0,
                imagen: "dos.jpg",
                descripcion: "La secuela de UNO, ¡más diversión y rapidez!",
                subcategorias: [15], // Rápidos
            },
            {
                nombre: "Cards Against Humanity",
                precio: 3000.0,
                imagen: "cah.jpg",
                descripcion:
                    "Juego de cartas para adultos, creatividad y humor.",
                subcategorias: [16, 14], // Graciosos, Party Games
            },
            {
                nombre: "Mus",
                precio: 1200.0,
                imagen: "mus.jpg",
                descripcion: "Juego de cartas tradicional español.",
                subcategorias: [10, 13], // Baraja española, Clasico
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
