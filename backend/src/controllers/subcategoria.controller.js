const Subcategoria = require('../models/subcategoria.model.js');
const Categoria = require('../models/categoria.model.js');

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