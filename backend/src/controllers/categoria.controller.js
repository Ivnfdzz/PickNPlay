const categoriaModel = require('../models/categoriaModel.js');

const traerCategorias = async (req, res) => {
    try {
        const categorias = await categoriaModel.findAll(); // Obtiene todos los roles de la base de datos
        res.json(categorias); // Envía los roles como respuesta en formato JSON
    } catch (error) {
        res.json({message: error.message});
    }
}

const traerCategoria = async (req, res) => {
    try {
        const categoria = await categoriaModel.findByPk(req.params.id)
        res.json(categoria);
    } catch (error) {
        res.json({message: error.message});
    }
}

const crearCategoria = async (req, res) => {
    try {
        await categoriaModel.create(req.body)
        res.json("Categoria creada correctamente");
    } catch (error) {
        res.json({message: error.message});
    }
}

const actualizarCategoria = async (req, res) => {
    try {
        await categoriaModel.update(req.body, {
            where: {id_categoria: req.params.id}
        })
        res.json("Categoria actualizada correctamente");
    } catch (error) {
        res.json({message: error.message});
    }
}

const borrarCategoria = async (req, res) => {
    try {
        await categoriaModel.destroy({
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