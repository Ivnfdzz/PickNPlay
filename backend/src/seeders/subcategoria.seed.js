const Subcategoria = require("../models/subcategoria.model.js");

const crearSubcategorias = async () => {
    try {
        const subcategoriasExistentes = await Subcategoria.count();
        if (subcategoriasExistentes > 0) {
            console.log("Subcategorías ya existen, saltando...");
            return;
        }

        await Subcategoria.bulkCreate([
            // Subcategorías para Juegos de Mesa (id_categoria: 1)
            { nombre: "Estrategia", id_categoria: 1 }, // id_subcategoria: 1
            { nombre: "Familiar", id_categoria: 1 }, // id_subcategoria: 2
            { nombre: "Fichas", id_categoria: 1 }, // id_subcategoria: 3
            { nombre: "Tablero", id_categoria: 1 }, // id_subcategoria: 4
            { nombre: "Misterio", id_categoria: 1 }, // id_subcategoria: 5
            { nombre: "Dados", id_categoria: 1 }, // id_subcategoria: 6
            { nombre: "Puntos", id_categoria: 1 }, // id_subcategoria: 7
            { nombre: "Uno contra uno", id_categoria: 1 }, // id_subcategoria: 8
            { nombre: "Logica", id_categoria: 1 }, // id_subcategoria: 9

            // Subcategorías para Juegos de Cartas (id_categoria: 2)
            { nombre: "Baraja española", id_categoria: 2 }, // id_subcategoria: 10
            { nombre: "Baraja francesa", id_categoria: 2 }, // id_subcategoria: 11
            { nombre: "Tradicional", id_categoria: 2 }, // id_subcategoria: 12
            { nombre: "Clasico", id_categoria: 2 }, // id_subcategoria: 13
            { nombre: "Party Games", id_categoria: 2 }, // id_subcategoria: 14
            { nombre: "Rápidos", id_categoria: 2 }, // id_subcategoria: 15  
            { nombre: "Graciosos", id_categoria: 2 }, // id_subcategoria: 16
        ]);

        console.log("Subcategorías creadas");
    } catch (error) {
        console.error("Error creando subcategorías:", error);
    }
};

module.exports = crearSubcategorias;
