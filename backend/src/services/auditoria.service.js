/**
 * @fileoverview Servicio de Auditoría para el sistema Pick&Play
 * 
 * Gestiona el registro y consulta de logs de auditoría del sistema, proporcionando
 * trazabilidad completa de las acciones realizadas por los usuarios. Implementa
 * funcionalidades para registrar acciones, obtener logs filtrados y generar
 * estadísticas de actividad.
 * 
 * Este servicio es fundamental para la seguridad, cumplimiento normativo,
 * debugging y análisis de patrones de uso del sistema.
 * 
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const LogAccionUsuario = require('../models/logAccionUsuario.model.js');
const Accion = require('../models/accion.model.js');
const Usuario = require('../models/usuario.model.js');
const Producto = require('../models/producto.model.js');
const { Op } = require('sequelize');

/**
 * Servicio para la gestión del sistema de auditoría y trazabilidad
 * 
 * @class AuditoriaService
 * @description Proporciona métodos para registrar acciones de usuarios,
 *              consultar logs con filtros avanzados y generar estadísticas
 *              de actividad del sistema.
 */
class AuditoriaService {
    /**
     * Registra una acción realizada por un usuario en el sistema
     * 
     * @async
     * @param {number} id_usuario - ID del usuario que realiza la acción
     * @param {string} nombreAccion - Nombre de la acción a registrar
     * @param {number} id_producto - ID del producto afectado por la acción
     * @returns {Promise<Object|null>} El log creado o null si hay error
     * @throws {Error} Si faltan parámetros o los datos no son válidos
     * 
     * @example
     * const log = await AuditoriaService.registrarAccion(1, 'crear_producto', 5);
     * console.log(log.id_log); // ID del log creado
     */
    static async registrarAccion(id_usuario, nombreAccion, id_producto) {
        try {
            if (!id_usuario || !nombreAccion || !id_producto) {
                throw new Error("Faltan parámetros para auditoría");
            }

            const accion = await this._obtenerAccionPorNombre(nombreAccion);

            if (!accion) {
                throw new Error(`Acción '${nombreAccion}' no encontrada en la DB`);
            }

            await this._validarDatos(id_usuario, id_producto);

            const nuevoLog = await LogAccionUsuario.create({
                id_usuario: id_usuario,
                id_accion: accion.id_accion,
                id_producto: id_producto,
                fecha_hora: new Date()
            });

            return nuevoLog;

        } catch (error) {
            console.error('Error registrando auditoría:', error.message);
        }
    }

    /**
     * Obtiene logs de auditoría con filtros opcionales
     * 
     * @async
     * @param {Object} filtros - Objeto con filtros de búsqueda
     * @param {number} [filtros.id_usuario] - Filtrar por usuario específico
     * @param {number} [filtros.id_accion] - Filtrar por tipo de acción
     * @param {Date} [filtros.fecha_desde] - Filtrar desde fecha específica
     * @param {number} [filtros.id_producto] - Filtrar por producto específico
     * @param {number} [filtros.limite=100] - Límite de registros a retornar
     * @returns {Promise<Array>} Array de logs con información relacionada
     * 
     * @example
     * const logs = await AuditoriaService.obtenerLogs({
     *   id_usuario: 1,
     *   fecha_desde: new Date('2025-01-01'),
     *   limite: 50
     * });
     */
    static async obtenerLogs(filtros = {}) {
        const whereClause = {};

        // Filtro por usuario
        if (filtros.id_usuario) {
            whereClause.id_usuario = filtros.id_usuario;
        }

        // Filtro por acción
        if (filtros.id_accion) {
            whereClause.id_accion = filtros.id_accion;
        }

        // Filtro por fecha desde
        if (filtros.fecha_desde) {
            whereClause.fecha_hora = {
                [Op.gte]: filtros.fecha_desde
            };
        }

        // Filtro por producto
        if (filtros.id_producto) {
            whereClause.id_producto = filtros.id_producto;
        }

        return await LogAccionUsuario.findAll({
            where: whereClause,
            include: [
                {
                    model: Usuario,
                    attributes: ['username', 'email']
                },
                {
                    model: Accion,
                    attributes: ['nombre']
                },
                {
                    model: Producto,
                    attributes: ['nombre']
                }
            ],
            order: [['fecha_hora', 'DESC']],
            limit: filtros.limite || 100
        });
    }

    /**
     * Genera estadísticas agregadas de actividad del sistema
     * 
     * @async
     * @returns {Promise<Object>} Objeto con estadísticas de auditoría
     * @property {number} total_acciones - Total de acciones registradas
     * @property {Object} acciones_por_tipo - Contador de acciones por tipo
     * @property {Object} usuarios_mas_activos - Contador de acciones por usuario
     * @property {Object} productos_mas_modificados - Contador de modificaciones por producto
     * @property {Array} acciones_recientes - Las 10 acciones más recientes
     * 
     * @description Procesa hasta 1000 logs recientes para generar estadísticas
     *              de uso del sistema. Maneja productos eliminados mostrando
     *              su ID original para trazabilidad.
     */
    static async obtenerEstadisticas() {
        const logs = await LogAccionUsuario.findAll({
            include: [
                {
                    model: Usuario,
                    attributes: ['username']
                },
                {
                    model: Accion,
                    attributes: ['nombre']
                },
                {
                    model: Producto,
                    attributes: ['nombre']
                }
            ],
            limit: 1000
        });

        // Contar por tipo de acción
        const accionesPorTipo = {};
        logs.forEach(log => {
            const accion = log.Accion?.nombre || "-";
            accionesPorTipo[accion] = (accionesPorTipo[accion] || 0) + 1;
        });

        // Contar por usuario
        const usuariosMasActivos = {};
        logs.forEach(log => {
            const usuario = log.Usuario?.username || "-";
            usuariosMasActivos[usuario] = (usuariosMasActivos[usuario] || 0) + 1;
        });

        const productosMasModificados = {};
        logs.forEach(log => {
            let producto = log.Producto?.nombre;
            if (!producto && log.id_producto) {
                producto = `Producto eliminado (ID: ${log.id_producto})`;
            }
            producto = producto || "-";
            productosMasModificados[producto] = (productosMasModificados[producto] || 0) + 1;
        });

        return {
            total_acciones: logs.length,
            acciones_por_tipo: accionesPorTipo,
            usuarios_mas_activos: usuariosMasActivos,
            productos_mas_modificados: productosMasModificados,
            acciones_recientes: logs.slice(0, 10).map(log => ({
                usuario: log.Usuario?.username || "-",
                accion: log.Accion?.nombre || "-",
                producto: log.Producto?.nombre || (log.id_producto ? `Producto eliminado (ID: ${log.id_producto})` : "-"),
                fecha: log.fecha_hora
            })) 
        };
    }

    /**
     * Busca una acción por su nombre en la base de datos
     * 
     * @async
     * @private
     * @param {string} nombreAccion - Nombre de la acción a buscar
     * @returns {Promise<Object|null>} La acción encontrada o null
     */
    static async _obtenerAccionPorNombre(nombreAccion) {
        return await Accion.findOne({
            where: { nombre: nombreAccion }
        });
    }

    /**
     * Valida que el usuario y producto existan en la base de datos
     * 
     * @async
     * @private
     * @param {number} id_usuario - ID del usuario a validar
     * @param {number} id_producto - ID del producto a validar
     * @returns {Promise<boolean>} true si ambos existen
     * @throws {Error} Si el usuario o producto no existen
     */
    static async _validarDatos(id_usuario, id_producto) {
        const usuario = await Usuario.findByPk(id_usuario);
        if (!usuario) {
            throw new Error(`Usuario con ID ${id_usuario} no encontrado`);
        }
        if (!id_producto) {
            throw new Error("ID de producto es requerido para auditoría");
        }

        const producto = await Producto.findByPk(id_producto);
        if (!producto) {
            throw new Error(`Producto con ID ${id_producto} no encontrado`);
        }

        return true;
    }
}

/**
 * Exporta el servicio de auditoría para su uso en controladores y middlewares.
 * 
 * @module AuditoriaService
 * @description Servicio central para el sistema de trazabilidad y auditoría.
 *              Utilizado principalmente por el middleware de auditoría y
 *              el controlador de auditoría para el dashboard administrativo.
 */
module.exports = AuditoriaService;