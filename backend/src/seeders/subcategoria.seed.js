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
            { nombre: "Estrategia", id_categoria: 1 },
            { nombre: "Familiar", id_categoria: 1 },
            { nombre: "Party Games", id_categoria: 1 },
            { nombre: "Cooperativo", id_categoria: 1 },

            // Subcategorías para Juegos de Cartas (id_categoria: 2)
            { nombre: "Truco", id_categoria: 2 },
            { nombre: "Chin Chon", id_categoria: 2 },
            { nombre: "Poker", id_categoria: 2 },
            { nombre: "BlackJack", id_categoria: 2 },
            { nombre: "Rápidos", id_categoria: 2 },
        ]);

        console.log("Subcategorías creadas");
    } catch (error) {
        console.error("Error creando subcategorías:", error);
    }
};

module.exports = crearSubcategorias;
