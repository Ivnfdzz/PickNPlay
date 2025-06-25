const Producto = require('../models/producto.model.js');
const Categoria = require('../models/categoria.model.js');
const Subcategoria = require('../models/subcategoria.model.js');
const { Op } = require('sequelize');

const traerProductos = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['nombre']
                },
                {
                    model: Subcategoria,
                    as: 'subcategorias',
                    attributes: ['nombre'],
                    through: { attributes: [] }
                }
            ]
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const traerProducto = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id, {
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['nombre']
                },
                {
                    model: Subcategoria,
                    as: 'subcategorias',
                    attributes: ['nombre'],
                    through: { attributes: [] }
                }
            ]
        });
        
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        res.json(producto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const traerProductosPorCategoria = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            where: { 
                id_categoria: req.params.categoriaId
            },
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['nombre']
                },
                {
                    model: Subcategoria,
                    as: 'subcategorias',
                    attributes: ['nombre'],
                    through: { attributes: [] }
                }
            ]
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const traerProductosActivos = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            where: { activo: true },
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['nombre']
                },
                {
                    model: Subcategoria,
                    as: 'subcategorias',
                    attributes: ['nombre'],
                    through: { attributes: [] }
                }
            ]
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const crearProducto = async (req, res) => {
    try {
        const newProducto = await Producto.create(req.body);
        res.status(201).json({
            message: "Producto creado correctamente",
            producto: newProducto
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const [filasAfectadas] = await Producto.update(req.body, {
            where: { id_producto: req.params.id }
        });

        if (filasAfectadas === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json("Producto actualizado correctamente");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const borrarProducto = async (req, res) => {
    try {
        const filasAfectadas = await Producto.destroy({
            where: { id_producto: req.params.id }
        });

        if (filasAfectadas === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json("Producto eliminado correctamente");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Función específica para buscar productos (útil para el autoservicio)
const buscarProductos = async (req, res) => {
    try {
        const { q } = req.query; // ?q=monopoly
        
        if (!q || q.trim() === '') {
            return res.status(400).json({ message: 'Parámetro de búsqueda requerido' });
        }

        const productos = await Producto.findAll({
            where: {
                nombre: {
                    [Op.like]: `%${q}%`
                },
                activo: true
            },
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['nombre']
                },
                {
                    model: Subcategoria,
                    as: 'subcategorias',
                    attributes: ['nombre'],
                    through: { attributes: [] }
                }
            ]
        });
        
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    traerProductos,
    traerProducto,
    traerProductosPorCategoria,
    traerProductosActivos,
    crearProducto,
    actualizarProducto,
    borrarProducto,
    buscarProductos
};