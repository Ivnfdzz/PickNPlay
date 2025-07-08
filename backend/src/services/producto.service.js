/**
 * @fileoverview Servicio de Productos para el sistema Pick&Play
 * 
 * Gestiona la lógica de negocio relacionada con productos de alquiler,
 * incluyendo operaciones CRUD, búsquedas avanzadas, filtrado por categorías
 * y subcategorías, y gestión de relaciones many-to-many con subcategorías.
 * 
 * Implementa consultas complejas para obtener productos por categoría
 * evitando duplicados, validaciones de datos de productos, y manejo
 * de estados activo/inactivo para control de inventario.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const Producto = require("../models/producto.model.js");
const Categoria = require("../models/categoria.model.js");
const Subcategoria = require("../models/subcategoria.model.js");
const ProductoSubcategoria = require("../models/productoSubcategoria.model.js");
const { Op } = require("sequelize");

/**
 * Servicio para la gestión de productos del catálogo
 * 
 * @class ProductoService
 * @description Proporciona métodos para gestionar productos, incluyendo
 *              operaciones CRUD, búsquedas, filtrado por categorías y
 *              gestión de relaciones con subcategorías.
 */
class ProductoService {
    /**
     * Obtiene todos los productos con información completa
     * 
     * @async
     * @returns {Promise<Array>} Array de productos con subcategorías y categorías
     */
    static async obtenerTodos() {
        return await Producto.findAll({
            include: this._getIncludeCompleto(),
        });
    }

    /**
     * Obtiene un producto específico por ID
     * 
     * @async
     * @param {number} id - ID del producto
     * @returns {Promise<Object|null>} Producto con información completa o null
     */
    static async obtenerPorId(id) {
        return await Producto.findByPk(id, {
            include: this._getIncludeCompleto(),
        });
    }

    /**
     * Obtiene solo productos activos
     * 
     * @async
     * @returns {Promise<Array>} Array de productos activos con información completa
     */
    static async obtenerActivos() {
        return await Producto.findAll({
            where: { activo: true },
            include: this._getIncludeCompleto(),
        });
    }

    /**
     * Busca productos por término en el nombre
     * 
     * @async
     * @param {string} termino - Término de búsqueda
     * @returns {Promise<Array>} Array de productos que coinciden con la búsqueda
     * @throws {Error} Si el término está vacío
     */
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

    /**
     * Obtiene productos únicos por categoría evitando duplicados
     * 
     * @async
     * @param {number} categoriaId - ID de la categoría
     * @returns {Promise<Object>} Objeto con productos únicos y datos de categoría
     * @property {Array} productos - Array de productos únicos de la categoría
     * @property {Object} categoria - Información de la categoría
     * 
     * @description Implementa lógica compleja para obtener productos únicos
     *              cuando un producto puede pertenecer a múltiples subcategorías
     *              de la misma categoría.
     */
    static async obtenerPorCategoria(categoriaId) {
        try {
            // Obtener todos los productos que tienen subcategorías de esta categoría
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

            // Procesar y agrupar productos únicos
            const productosMap = new Map();

            subcategorias.forEach(subcategoria => {
                subcategoria.productos.forEach(producto => {
                    const productoId = producto.id_producto;

                    if (!productosMap.has(productoId)) {
                        // Crear producto con array vacío de subcategorías
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

                    // Agregar subcategoría al producto
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

            // Convertir Map a Array
            const productosUnicos = Array.from(productosMap.values());

            // Obtener información de la categoría
            const categoria = subcategorias.length > 0 ?
                subcategorias[0].categoria :
                await Categoria.findByPk(categoriaId);

            return {
                productos: productosUnicos,
                categoria: categoria
            };

        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtiene productos de una subcategoría específica
     * 
     * @async
     * @param {number} subcategoriaId - ID de la subcategoría
     * @returns {Promise<Object>} Subcategoría con productos y categoría padre
     * @throws {Error} Si la subcategoría no existe
     */
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

    /**
     * Crea un nuevo producto con subcategorías asociadas
     * 
     * @async
     * @param {Object} data - Datos del producto a crear
     * @param {string} data.nombre - Nombre único del producto
     * @param {number} data.precio - Precio de alquiler
     * @param {string} data.imagen - Nombre del archivo de imagen
     * @param {string} [data.descripcion] - Descripción opcional
     * @param {Array<number>} data.subcategorias - Array de IDs de subcategorías
     * @returns {Promise<Object>} Producto creado con información completa
     * @throws {Error} Si faltan datos o subcategorías inválidas
     */
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

    /**
     * Actualiza un producto existente
     * 
     * @async
     * @param {number} id - ID del producto a actualizar
     * @param {Object} data - Datos a actualizar
     * @param {Array<number>} [data.subcategorias] - Nuevas subcategorías (opcional)
     * @returns {Promise<string>} Mensaje de confirmación
     * @throws {Error} Si el producto no existe o datos inválidos
     */
    static async actualizar(id, data) {
        id = parseInt(id);
        const { subcategorias, ...datosProducto } = data;

        let filasAfectadas = 0;
        if (Object.keys(datosProducto).length > 0) {
            [filasAfectadas] = await Producto.update(datosProducto, {
                where: { id_producto: id },
            });
        }

        // Verificar si el producto existe
        if (filasAfectadas === 0) {
            const productoExistente = await Producto.findByPk(id);
            if (!productoExistente) {
                throw new Error("Producto no encontrado");
            }
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

    /**
     * Elimina un producto por ID
     * 
     * @async
     * @param {number} id - ID del producto a eliminar
     * @returns {Promise<string>} Mensaje de confirmación
     * @throws {Error} Si el producto no existe
     */
    static async eliminar(id) {
        const filasAfectadas = await Producto.destroy({
            where: { id_producto: id },
        });

        if (filasAfectadas === 0) {
            throw new Error("Producto no encontrado");
        }

        return "Producto eliminado correctamente";
    }

    /**
     * Valida que un producto exista y esté activo
     * 
     * @async
     * @param {number} id - ID del producto a validar
     * @returns {Promise<Object>} Producto validado
     * @throws {Error} Si el producto no existe o está inactivo
     */
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

    /**
     * Configuración de include para consultas completas
     * 
     * @private
     * @returns {Array} Array de configuración de includes para Sequelize
     */
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

    /**
     * Valida la estructura básica de los datos del producto
     * 
     * @private
     * @param {Object} data - Datos del producto a validar
     * @throws {Error} Si faltan campos requeridos o valores inválidos
     */
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

    /**
     * Valida que todas las subcategorías existan en el sistema
     * 
     * @async
     * @private
     * @param {Array<number>} subcategorias - Array de IDs de subcategorías
     * @returns {Promise<Array>} Array de subcategorías validadas
     * @throws {Error} Si alguna subcategoría no existe
     */
    static async _validarSubcategorias(subcategorias) {
        if (!Array.isArray(subcategorias)) {
            throw new Error("Las subcategorías deben ser un array de IDs");
        }
        
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

    /**
     * Asigna subcategorías a un producto en la tabla intermedia
     * 
     * @async
     * @private
     * @param {number} id_producto - ID del producto
     * @param {Array<number>} subcategorias - Array de IDs de subcategorías
     */
    static async _asignarSubcategorias(id_producto, subcategorias) {
        const asignaciones = subcategorias.map((id_subcategoria) => ({
            id_producto,
            id_subcategoria: Number(id_subcategoria),
        }));
        await ProductoSubcategoria.bulkCreate(asignaciones);
    }

    /**
     * Actualiza las subcategorías de un producto eliminando las anteriores
     * 
     * @async
     * @private
     * @param {number} id_producto - ID del producto
     * @param {Array<number>} nuevasSubcategorias - Array de nuevas subcategorías
     */
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

/**
 * Exporta el servicio de productos para su uso en controladores.
 * 
 * @module ProductoService
 * @description Servicio central para la gestión del catálogo de productos.
 *              Utilizado por controladores de productos y funciones del autoservicio.
 */
module.exports = ProductoService;
