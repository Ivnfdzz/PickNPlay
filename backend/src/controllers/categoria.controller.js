/**
 * @fileoverview Controlador para la gestión de categorías en el sistema Pick&Play.
 * Permite crear, actualizar, eliminar y consultar categorías de productos.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const Categoria = require('../models/categoria.model.js');

/**
 * Obtiene todas las categorías registradas.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un array de categorías en formato JSON.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const traerCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.json(categorias);
    } catch (error) {
        res.json({message: error.message});
    }
}

/**
 * Obtiene una categoría específica por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID de la categoría en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve la categoría encontrada o error si no existe.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const traerCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id)
        res.json(categoria);
    } catch (error) {
        res.json({message: error.message});
    }
}

/**
 * Crea una nueva categoría.
 * @param {import('express').Request} req - Solicitud HTTP con los datos de la categoría en el body.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si ocurre un error en la creación.
 */
const crearCategoria = async (req, res) => {
    try {
        await Categoria.create(req.body)
        res.json("Categoria creada correctamente");
    } catch (error) {
        res.json({message: error.message});
    }
}

/**
 * Actualiza una categoría existente por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID de la categoría y los datos a actualizar.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si ocurre un error en la actualización.
 */
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

/**
 * Elimina una categoría por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID de la categoría en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si ocurre un error en la eliminación.
 */
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