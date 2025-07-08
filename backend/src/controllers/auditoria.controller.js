/**
 * @fileoverview Controlador de auditoría para el sistema Pick&Play.
 * Permite consultar logs, estadísticas y resúmenes de acciones de usuarios y productos.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const AuditoriaService = require("../services/auditoria.service.js");

/**
 * Obtiene logs de auditoría filtrados por usuario, acción, producto o fecha.
 * @param {import('express').Request} req - Solicitud HTTP con filtros opcionales en query.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve un objeto con el total y los logs encontrados.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const obtenerLogs = async (req, res) => {
    try {
        const filtros = {
            id_usuario: req.query.usuario,
            id_accion: req.query.accion,
            id_producto: req.query.producto,
            fecha_desde: req.query.desde,
            limite: req.query.limite ? parseInt(req.query.limite, 10) : 50,
        };

        const logs = await AuditoriaService.obtenerLogs(filtros);

        res.json({
            total: logs.length,
            logs: logs.map((log) => ({
                id: log.id_log,
                usuario: log.Usuario
                    ? {
                        id: log.Usuario.id_usuario,
                        username: log.Usuario.username,
                        email: log.Usuario.email,
                    }
                    : null,
                accion: log.Accion
                    ? {
                        id: log.Accion.id_accion,
                        nombre: log.Accion.nombre,
                    }
                    : null,
                producto: log.Producto
                    ? {
                        id: log.Producto.id_producto,
                        nombre: log.Producto.nombre,
                    }
                    : log.id_producto
                        ? {
                            id: log.id_producto,
                            nombre: "Producto eliminado "
                        }
                        : null,
                fecha_hora: log.fecha_hora,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene estadísticas generales de auditoría.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve estadísticas generales.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const obtenerEstadisticas = async (req, res) => {
    try {
        const estadisticas = await AuditoriaService.obtenerEstadisticas();
        res.json(estadisticas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene logs de auditoría para un usuario específico.
 * @param {import('express').Request} req - Solicitud HTTP con el ID de usuario en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve logs del usuario o error si no hay registros.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const obtenerLogsPorUsuario = async (req, res) => {
    try {
        const filtros = {
            id_usuario: req.params.userId,
            limite: req.query.limite ? parseInt(req.query.limite, 10) : 20,
        };

        const logs = await AuditoriaService.obtenerLogs(filtros);

        if (logs.length === 0) {
            return res.status(404).json({
                message: "No se encontraron logs para este usuario",
            });
        }

        res.json({
            usuario_id: req.params.userId,
            total_acciones: logs.length,
            logs: logs.map((log) => ({
                id: log.id_log,
                accion: log.Accion.nombre,
                producto: log.Producto.nombre,
                fecha_hora: log.fecha_hora,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene logs de auditoría para un producto específico.
 * @param {import('express').Request} req - Solicitud HTTP con el ID de producto en los parámetros.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve logs del producto o error si no hay registros.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const obtenerLogsPorProducto = async (req, res) => {
    try {
        const filtros = {
            id_producto: req.params.productId,
            limite: req.query.limite || 20,
        };

        const logs = await AuditoriaService.obtenerLogs(filtros);

        if (logs.length === 0) {
            return res.status(404).json({
                message: "No se encontraron logs para este producto",
            });
        }

        res.json({
            producto_id: req.params.productId,
            producto_nombre: logs[0].Producto.nombre,
            total_modificaciones: logs.length,
            logs: logs.map((log) => ({
                id: log.id_log,
                usuario: log.Usuario.username,
                accion: log.Accion.nombre,
                fecha_hora: log.fecha_hora,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene un resumen semanal de actividad y estadísticas generales de auditoría.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @returns {void} Devuelve resumen semanal, estadísticas y actividad reciente.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const obtenerResumen = async (req, res) => {
    try {
        // Obtener logs recientes (últimos 7 días)
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 7);

        const logsRecientes = await AuditoriaService.obtenerLogs({
            fecha_desde: fechaDesde,
            limite: 100,
        });

        // Obtener estadísticas generales
        const estadisticas = await AuditoriaService.obtenerEstadisticas();

        res.json({
            resumen_semanal: {
                total_acciones: logsRecientes.length,
                periodo: "Últimos 7 días",
            },
            estadisticas_generales: estadisticas,
            actividad_reciente: logsRecientes.slice(0, 5).map((log) => ({
                usuario: log.Usuario.username,
                accion: log.Accion.nombre,
                producto: log.Producto.nombre,
                fecha: log.fecha_hora,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    obtenerLogs,
    obtenerEstadisticas,
    obtenerLogsPorUsuario,
    obtenerLogsPorProducto,
    obtenerResumen,
};
