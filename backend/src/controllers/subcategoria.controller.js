/**
 * @fileoverview Controlador para la gestión de subcategorías en el sistema Pick&Play.
 * Permite crear, actualizar, eliminar y consultar subcategorías, así como filtrarlas por categoría.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const Subcategoria = require('../models/subcategoria.model.js');
const Categoria = require('../models/categoria.model.js');

/**
 * Obtiene todas las subcategorías, incluyendo el nombre de la categoría asociada.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un array de subcategorías en formato JSON.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const traerSubcategorias = async (req, res) => {
    try {
        const subcategorias = await Subcategoria.findAll({
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['nombre']
                }
            ]
        });
        res.json(subcategorias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene una subcategoría específica por su ID, incluyendo el nombre de la categoría asociada.
 * @param {import('express').Request} req - Solicitud HTTP con el ID de la subcategoría en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve la subcategoría encontrada o error si no existe.
 * @throws {Error} Si la subcategoría no existe o hay un error en la consulta.
 */
const traerSubcategoria = async (req, res) => {
    try {
        const subcategoria = await Subcategoria.findByPk(req.params.id, {
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['nombre']
                }
            ]
        });

        if (!subcategoria) {
            return res.status(404).json({ message: 'Subcategoría no encontrada' });
        }

        res.json(subcategoria);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene todas las subcategorías asociadas a una categoría específica.
 * @param {import('express').Request} req - Solicitud HTTP con el ID de la categoría en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un array de subcategorías.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const traerSubcategoriasPorCategoria = async (req, res) => {
    try {
        const subcategorias = await Subcategoria.findAll({
            where: { id_categoria: req.params.categoriaId },
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['nombre']
                }
            ]
        });

        res.json(subcategorias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Crea una nueva subcategoría, validando que la categoría asociada exista.
 * @param {import('express').Request} req - Solicitud HTTP con los datos de la subcategoría en el body.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve la subcategoría creada o error de validación.
 * @throws {Error} Si faltan datos requeridos o la categoría no existe.
 */
const crearSubcategoria = async (req, res) => {
    try {
        const { nombre, id_categoria } = req.body;

        // Validar datos requeridos
        if (!nombre || !id_categoria) {
            return res.status(400).json({ 
                message: 'Nombre e id_categoria son requeridos' 
            });
        }

        // Verificar que la categoría existe
        const categoria = await Categoria.findByPk(id_categoria);
        if (!categoria) {
            return res.status(404).json({ 
                message: 'La categoría especificada no existe' 
            });
        }

        const nuevaSubcategoria = await Subcategoria.create({
            nombre,
            id_categoria
        });

        res.status(201).json({
            message: 'Subcategoría creada correctamente',
            subcategoria: nuevaSubcategoria
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Actualiza una subcategoría existente por su ID, validando la existencia de la categoría si se modifica.
 * @param {import('express').Request} req - Solicitud HTTP con el ID y los datos a actualizar.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si la subcategoría o la categoría no existen, o hay un error en la actualización.
 */
const actualizarSubcategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, id_categoria } = req.body;

        // Si se está actualizando la categoría, verificar que existe
        if (id_categoria) {
            const categoria = await Categoria.findByPk(id_categoria);
            if (!categoria) {
                return res.status(404).json({ 
                    message: 'La categoría especificada no existe' 
                });
            }
        }

        const [filasAfectadas] = await Subcategoria.update(req.body, {
            where: { id_subcategoria: id }
        });

        if (filasAfectadas === 0) {
            return res.status(404).json({ message: 'Subcategoría no encontrada' });
        }

        res.json('Subcategoría actualizada correctamente');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Elimina una subcategoría por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si la subcategoría no existe o hay un error en la eliminación.
 */
const borrarSubcategoria = async (req, res) => {
    try {
        const filasAfectadas = await Subcategoria.destroy({
            where: { id_subcategoria: req.params.id }
        });

        if (filasAfectadas === 0) {
            return res.status(404).json({ message: 'Subcategoría no encontrada' });
        }

        res.json('Subcategoría eliminada correctamente');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    traerSubcategorias,
    traerSubcategoria,
    traerSubcategoriasPorCategoria,
    crearSubcategoria,
    actualizarSubcategoria,
    borrarSubcategoria
};