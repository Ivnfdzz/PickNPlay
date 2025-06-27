const Producto = require("../models/producto.model.js");
const Categoria = require("../models/categoria.model.js");
const Subcategoria = require("../models/subcategoria.model.js");
const { Op } = require("sequelize");

const traerProductos = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [
                {
                    model: Subcategoria,
                    as: "subcategorias",
                    attributes: ["nombre"],
                    through: { attributes: [] },
                    include: [
                        {
                            model: Categoria,
                            attributes: ["nombre"],
                        },
                    ],
                },
            ],
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
                    model: Subcategoria,
                    as: "subcategorias",
                    attributes: ["nombre"],
                    through: { attributes: [] },
                    include: [
                        {
                            model: Categoria,
                            attributes: ["nombre"],
                        },
                    ],
                },
            ],
        });

        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(producto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const traerProductosPorSubcategoria = async (req, res) => {
    try {
        const { subcategoriaId } = req.params;

        const subcategoria = await Subcategoria.findByPk(subcategoriaId, {
            include: [
                {
                    model: Producto,
                    as: "productos",
                    through: { attributes: [] },
                    where: { activo: true },
                },
                {
                    model: Categoria,
                    attributes: ["nombre"],
                },
            ],
        });

        if (!subcategoria) {
            return res
                .status(404)
                .json({ message: "Subcategoría no encontrada" });
        }

        res.json(subcategoria);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ MODIFICADA: Productos por categoría (a través de subcategorías)
const traerProductosPorCategoria = async (req, res) => {
    try {
        const { categoriaId } = req.params;

        // Obtener la categoría con sus subcategorías y productos
        const categoria = await Categoria.findByPk(categoriaId, {
            include: [
                {
                    model: Subcategoria,
                    include: [
                        {
                            model: Producto,
                            as: "productos",
                            through: { attributes: [] },
                            where: { activo: true },
                        },
                    ],
                },
            ],
        });

        if (!categoria) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }

        // Aplanar los productos de todas las subcategorías
        const productos = [];
        categoria.Subcategorias.forEach((subcategoria) => {
            productos.push(...subcategoria.productos);
        });

        res.json({
            categoria: {
                id_categoria: categoria.id_categoria,
                nombre: categoria.nombre,
            },
            productos: productos,
        });
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
                    model: Subcategoria,
                    as: 'subcategorias',
                    attributes: ['nombre'],
                    through: { attributes: [] },
                    include: [
                        {
                            model: Categoria,
                            attributes: ['nombre']
                        }
                    ]
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
            producto: newProducto,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const [filasAfectadas] = await Producto.update(req.body, {
            where: { id_producto: req.params.id },
        });

        if (filasAfectadas === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json("Producto actualizado correctamente");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const borrarProducto = async (req, res) => {
    try {
        const filasAfectadas = await Producto.destroy({
            where: { id_producto: req.params.id },
        });

        if (filasAfectadas === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
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

        if (!q || q.trim() === "") {
            return res
                .status(400)
                .json({ message: "Parámetro de búsqueda requerido" });
        }

        const productos = await Producto.findAll({
            where: {
                nombre: {
                    [Op.like]: `%${q}%`,
                },
                activo: true,
            },
            include: [
                {
                    model: Subcategoria,
                    as: 'subcategorias',
                    attributes: ['nombre'],
                    through: { attributes: [] },
                    include: [
                        {
                            model: Categoria,
                            attributes: ['nombre']
                        }
                    ]
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
    traerProductosPorSubcategoria,
    traerProductosActivos,
    crearProducto,
    actualizarProducto,
    borrarProducto,
    buscarProductos,
};
