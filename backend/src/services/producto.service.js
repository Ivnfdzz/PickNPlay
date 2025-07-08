const Producto = require("../models/producto.model.js");
const Categoria = require("../models/categoria.model.js");
const Subcategoria = require("../models/subcategoria.model.js");
const ProductoSubcategoria = require("../models/productoSubcategoria.model.js");
const { Op } = require("sequelize");

class ProductoService {
    static async obtenerTodos() {
        return await Producto.findAll({
            include: this._getIncludeCompleto(),
        });
    }

    static async obtenerPorId(id) {
        return await Producto.findByPk(id, {
            include: this._getIncludeCompleto(),
        });
    }

    static async obtenerActivos() {
        return await Producto.findAll({
            where: { activo: true },
            include: this._getIncludeCompleto(),
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
            include: this._getIncludeCompleto(),
        });
    }

    static async obtenerPorCategoria(categoriaId) {
        try {
            // PASO 1: Obtener todos los productos que tienen subcategorías de esta categoría
            const subcategorias = await Subcategoria.findAll({
                where: { id_categoria: categoriaId },
                include: [
                    {
                        model: Producto,
                        as: "productos",
                        where: { activo: true },
                        attributes: ["id_producto", "nombre", "precio", "imagen", "descripcion", "activo"],
                        through: { attributes: [] }
                    },
                    {
                        model: Categoria,
                        as: "categoria",
                        attributes: ["id_categoria", "nombre"]
                    }
                ]
            });

            // PASO 2: Procesar y agrupar productos únicos
            const productosMap = new Map();

            subcategorias.forEach(subcategoria => {
                subcategoria.productos.forEach(producto => {
                    const productoId = producto.id_producto;

                    if (!productosMap.has(productoId)) {
                        // CREAR producto con array vacío de subcategorías
                        productosMap.set(productoId, {
                            id_producto: producto.id_producto,
                            nombre: producto.nombre,
                            precio: producto.precio,
                            imagen: producto.imagen,
                            descripcion: producto.descripcion,
                            activo: producto.activo,
                            subcategorias: []
                        });
                    }

                    // AGREGAR subcategoría al producto
                    productosMap.get(productoId).subcategorias.push({
                        id_subcategoria: subcategoria.id_subcategoria,
                        nombre: subcategoria.nombre,
                        categoria: {
                            id_categoria: subcategoria.categoria.id_categoria,
                            nombre: subcategoria.categoria.nombre
                        }
                    });
                });
            });

            // PASO 3: Convertir Map a Array
            const productosUnicos = Array.from(productosMap.values());

            // PASO 4: Obtener información de la categoría
            const categoria = subcategorias.length > 0 ?
                subcategorias[0].categoria :
                await Categoria.findByPk(categoriaId);

            console.log(`ProductoService.obtenerPorCategoria: ${productosUnicos.length} productos únicos encontrados`);

            return {
                productos: productosUnicos,
                categoria: categoria
            };

        } catch (error) {
            console.error('Error en ProductoService.obtenerPorCategoria:', error);
            throw error;
        }
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
        const { subcategorias, ...datosProducto } = data;

        this._validarDatosProducto(datosProducto);

        if (
            !subcategorias ||
            !Array.isArray(subcategorias) ||
            subcategorias.length === 0
        ) {
            throw new Error(
                "Debe proporcionar al menos una subcategoría para el producto"
            );
        }

        await this._validarSubcategorias(subcategorias);

        const nuevoProducto = await Producto.create(datosProducto);

        await this._asignarSubcategorias(
            nuevoProducto.id_producto,
            subcategorias
        );

        return await this.obtenerPorId(nuevoProducto.id_producto);
    }

    static async actualizar(id, data) {
        id = parseInt(id);
        const { subcategorias, ...datosProducto } = data;

        let filasAfectadas = 0;
        if (Object.keys(datosProducto).length > 0) {
            [filasAfectadas] = await Producto.update(datosProducto, {
                where: { id_producto: id },
            });
        }

        // Si no se afectó ninguna fila, chequeá si el producto existe
        if (filasAfectadas === 0) {
            const productoExistente = await Producto.findByPk(id);
            if (!productoExistente) {
                throw new Error("Producto no encontrado");
            }
            // Si existe, seguimos (puede ser solo update de subcategorías)
        }

        // Actualizar subcategorías si corresponde
        if (subcategorias !== undefined) {
            if (subcategorias.length > 0) {
                await this._validarSubcategorias(subcategorias);
            }
            await this._actualizarSubcategorias(id, subcategorias);
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
                attributes: ["id_subcategoria", "nombre"],
                through: { attributes: [] },
                include: [
                    {
                        model: Categoria,
                        as: "categoria",
                        attributes: ["id_categoria", "nombre"],
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

        if (typeof nombre !== "string" || nombre.trim() === "") {
            throw new Error("El nombre debe ser un texto válido");
        }
    }

    static async _validarSubcategorias(subcategorias) {
        if (!Array.isArray(subcategorias)) {
            throw new Error("Las subcategorías deben ser un array de IDs");
        }
        // Convertir a enteros
        const subcatIds = subcategorias.map(Number);
        const subcategoriasExistentes = await Subcategoria.findAll({
            where: { id_subcategoria: { [Op.in]: subcatIds } },
        });

        if (subcategoriasExistentes.length !== subcategorias.length) {
            const idsEncontrados = subcategoriasExistentes.map(
                (s) => s.id_subcategoria
            );
            const idsNoEncontrados = subcategorias.filter(
                (id) => !idsEncontrados.includes(id)
            );
            throw new Error(
                `Subcategorías no encontradas: ${idsNoEncontrados.join(", ")}`
            );
        }
        return subcategoriasExistentes;
    }

    static async _asignarSubcategorias(id_producto, subcategorias) {
        const asignaciones = subcategorias.map((id_subcategoria) => ({
            id_producto,
            id_subcategoria: Number(id_subcategoria),
        }));
        await ProductoSubcategoria.bulkCreate(asignaciones);
    }

    static async _actualizarSubcategorias(id_producto, nuevasSubcategorias) {
        // Eliminar asignaciones existentes
        await ProductoSubcategoria.destroy({
            where: { id_producto },
        });

        // Crear nuevas asignaciones si hay subcategorías
        if (nuevasSubcategorias.length > 0) {
            await this._asignarSubcategorias(id_producto, nuevasSubcategorias);
        }
    }
}

module.exports = ProductoService;
