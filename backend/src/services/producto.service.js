const Producto = require("../models/producto.model.js");
const Categoria = require("../models/categoria.model.js");
const Subcategoria = require("../models/subcategoria.model.js");
const { Op } = require("sequelize");

class ProductoService {
    static async obtenerTodos() {
        return await Producto.findAll({
            include: this._getIncludeCompleto()
        });
    }

    static async obtenerPorId(id) {
        return await Producto.findByPk(id, {
            include: this._getIncludeCompleto()
        });
    }

    static async obtenerActivos() {
        return await Producto.findAll({
            where: { activo: true },
            include: this._getIncludeCompleto()
        });
    }

    static async buscarPorTermino(termino) {
        if (!termino || termino.trim() === "") {
            throw new Error("Parámetro de búsqueda requerido");
        }

        return await Producto.findAll({
            where: {
                nombre: {
                    [Op.like]: `%${termino}%`,
                },
                activo: true,
            },
            include: this._getIncludeCompleto()
        });
    }

    static async obtenerPorCategoria(categoriaId) {
        const categoria = await Categoria.findByPk(categoriaId, {
            include: [
                {
                    model: Subcategoria,
                    as: 'subcategorias',
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
            throw new Error("Categoría no encontrada");
        }

        // Aplanar productos de todas las subcategorías
        const productos = [];
        categoria.subcategorias.forEach((subcategoria) => {
            productos.push(...subcategoria.productos);
        });

        return {
            categoria: {
                id_categoria: categoria.id_categoria,
                nombre: categoria.nombre,
            },
            productos: productos,
        };
    }

    static async obtenerPorSubcategoria(subcategoriaId) {
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
                    as: "categoria",
                    attributes: ["nombre"],
                },
            ],
        });

        if (!subcategoria) {
            throw new Error("Subcategoría no encontrada");
        }

        return subcategoria;
    }

    static async crear(data) {
        this._validarDatosProducto(data);
        
        return await Producto.create(data);
    }

    static async actualizar(id, data) {
        const [filasAfectadas] = await Producto.update(data, {
            where: { id_producto: id },
        });

        if (filasAfectadas === 0) {
            throw new Error("Producto no encontrado");
        }

        return "Producto actualizado correctamente";
    }

    static async eliminar(id) {
        const filasAfectadas = await Producto.destroy({
            where: { id_producto: id },
        });

        if (filasAfectadas === 0) {
            throw new Error("Producto no encontrado");
        }

        return "Producto eliminado correctamente";
    }

    static async validarProductoActivo(id) {
        const producto = await Producto.findByPk(id);
        
        if (!producto) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }

        if (!producto.activo) {
            throw new Error(`El producto ${producto.nombre} no está activo`);
        }

        return producto;
    }


    static _getIncludeCompleto() {
        return [
            {
                model: Subcategoria,
                as: "subcategorias",
                attributes: ["nombre"],
                through: { attributes: [] },
                include: [
                    {
                        model: Categoria,
                        as: "categoria",
                        attributes: ["nombre"],
                    },
                ],
            },
        ];
    }

    static _validarDatosProducto(data) {
        const { nombre, precio, imagen } = data;

        if (!nombre || !precio || !imagen) {
            throw new Error("Nombre, precio e imagen son requeridos");
        }

        if (precio <= 0) {
            throw new Error("El precio debe ser mayor a 0");
        }

        if (typeof nombre !== 'string' || nombre.trim() === '') {
            throw new Error("El nombre debe ser un texto válido");
        }
    }
}

module.exports = ProductoService;