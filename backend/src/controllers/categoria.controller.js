const Categoria = require('../models/categoria.model.js');

const traerCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.findAll(); // Obtiene todos los roles de la base de datos
        res.json(categorias); // Envía los roles como respuesta en formato JSON
    } catch (error) {
        res.json({message: error.message});
    }
}

const traerCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id)
        res.json(categoria);
    } catch (error) {
        res.json({message: error.message});
    }
}

const crearCategoria = async (req, res) => {
    try {
        await Categoria.create(req.body)
        res.json("Categoria creada correctamente");
    } catch (error) {
        res.json({message: error.message});
    }
}

const actualizarCategoria = async (req, res) => {
    try {
        await Categoria.update(req.body, {
            where: {id_categoria: req.params.id}
        })
        res.json("Categoria actualizada correctamente");
    } catch (error) {
        res.json({message: error.message});
    }
}

const borrarCategoria = async (req, res) => {
    try {
        await Categoria.destroy({
            where: {id_categoria: req.params.id}
        })
        res.json("Categoria eliminada correctamente");
    } catch (error) {
        res.json({message: error.message});
        
    }
}

module.exports = {
    traerCategorias,
    traerCategoria,
    crearCategoria,
    actualizarCategoria,
    borrarCategoria
};


//Estandarizacion de nombre de import