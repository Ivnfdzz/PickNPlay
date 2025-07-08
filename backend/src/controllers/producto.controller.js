/**
 * @fileoverview Controlador para la gestión de productos en el sistema Pick&Play.
 * Permite crear, actualizar, eliminar y consultar productos, así como búsquedas y filtrados.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const ProductoService = require("../services/producto.service.js");

/**
 * Obtiene todos los productos registrados.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un array de productos en formato JSON.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const traerProductos = async (req, res) => {
    try {
        const productos = await ProductoService.obtenerTodos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene un producto específico por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID del producto en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve el producto encontrado o error si no existe.
 * @throws {Error} Si el producto no existe o hay un error en la consulta.
 */
const traerProducto = async (req, res) => {
    try {
        const producto = await ProductoService.obtenerPorId(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene productos filtrados por categoría.
 * @param {import('express').Request} req - Solicitud HTTP con el ID de la categoría en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un array de productos o error si la categoría no existe.
 * @throws {Error} Si la categoría no existe o hay un error en la consulta.
 */
const traerProductosPorCategoria = async (req, res) => {
    try {
        const resultado = await ProductoService.obtenerPorCategoria(
            req.params.categoriaId
        );
        res.json(resultado);
    } catch (error) {
        if (error.message === "Categoría no encontrada") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene productos filtrados por subcategoría.
 * @param {import('express').Request} req - Solicitud HTTP con el ID de la subcategoría en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un array de productos o error si la subcategoría no existe.
 * @throws {Error} Si la subcategoría no existe o hay un error en la consulta.
 */
const traerProductosPorSubcategoria = async (req, res) => {
    try {
        const resultado = await ProductoService.obtenerPorSubcategoria(
            req.params.subcategoriaId
        );
        res.json(resultado);
    } catch (error) {
        if (error.message === "Subcategoría no encontrada") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene todos los productos activos.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un array de productos activos.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const traerProductosActivos = async (req, res) => {
    try {
        const productos = await ProductoService.obtenerActivos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Busca productos por término de búsqueda.
 * @param {import('express').Request} req - Solicitud HTTP con el término en query.q.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un array de productos o error si falta el parámetro.
 * @throws {Error} Si falta el parámetro de búsqueda o hay un error en la consulta.
 */
const buscarProductos = async (req, res) => {
    try {
        const productos = await ProductoService.buscarPorTermino(req.query.q);
        res.json(productos);
    } catch (error) {
        if (error.message === "Parámetro de búsqueda requerido") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Crea un nuevo producto.
 * @param {import('express').Request} req - Solicitud HTTP con los datos del producto en el body y archivo en req.file.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve el producto creado o error de validación.
 * @throws {Error} Si ocurre un error en la creación o validación.
 */
const crearProducto = async (req, res) => {
    try {
        if (req.file) {
            req.body.imagen = req.file.filename;
        }
        const nuevoProducto = await ProductoService.crear(req.body);
        res.status(201).json({
            message: "Producto creado correctamente",
            producto: nuevoProducto,
        });
    } catch (error) {
        if (
            error.message.includes("requeridos") ||
            error.message.includes("mayor a 0") ||
            error.message.includes("texto válido") ||
            error.message.includes("subcategoría") ||
            error.message.includes("no encontradas")
        ) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Actualiza un producto existente por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID y los datos a actualizar.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si el producto no existe o hay un error en la actualización.
 */
const actualizarProducto = async (req, res) => {
    try {
        if (req.file) {
            req.body.imagen = req.file.filename;
        }
        const mensaje = await ProductoService.actualizar(
            req.params.id,
            req.body
        );
        res.json(mensaje);
    } catch (error) {
        if (error.message === "Producto no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        if (
            error.message.includes("subcategoría") ||
            error.message.includes("no encontradas")
        ) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Elimina un producto por su ID.
 * @param {import('express').Request} req - Solicitud HTTP con el ID en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve mensaje de éxito o error.
 * @throws {Error} Si el producto no existe o hay un error en la eliminación.
 */
const borrarProducto = async (req, res) => {
    try {
        const mensaje = await ProductoService.eliminar(req.params.id);
        res.json(mensaje);
    } catch (error) {
        if (error.message === "Producto no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    traerProductos,
    traerProducto,
    traerProductosPorCategoria,
    traerProductosPorSubcategoria,
    traerProductosActivos,
    crearProducto,
    actualizarProducto,
    borrarProducto,
    buscarProductos,
};
