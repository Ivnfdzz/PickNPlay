const ProductoService = require('../services/producto.service.js');

const traerProductos = async (req, res) => {
    try {
        const productos = await ProductoService.obtenerTodos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

const traerProductosPorCategoria = async (req, res) => {
    try {
        const resultado = await ProductoService.obtenerPorCategoria(req.params.categoriaId);
        res.json(resultado);
    } catch (error) {
        if (error.message === "Categoría no encontrada") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const traerProductosPorSubcategoria = async (req, res) => {
    try {
        const resultado = await ProductoService.obtenerPorSubcategoria(req.params.subcategoriaId);
        res.json(resultado);
    } catch (error) {
        if (error.message === "Subcategoría no encontrada") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const traerProductosActivos = async (req, res) => {
    try {
        const productos = await ProductoService.obtenerActivos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

const crearProducto = async (req, res) => {
    try {
        const nuevoProducto = await ProductoService.crear(req.body);
        res.status(201).json({
            message: "Producto creado correctamente",
            producto: nuevoProducto,
        });
    } catch (error) {
        if (error.message.includes('requeridos') || 
            error.message.includes('mayor a 0') ||
            error.message.includes('texto válido')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const mensaje = await ProductoService.actualizar(req.params.id, req.body);
        res.json(mensaje);
    } catch (error) {
        if (error.message === "Producto no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

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