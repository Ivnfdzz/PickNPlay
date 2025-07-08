/**
 * @fileoverview Middleware de auditoría para Pick&Play.
 * Intercepta requests de productos y registra automáticamente acciones de auditoría (crear, actualizar) asociadas a un usuario y producto.
 * No audita operaciones DELETE ni GET.
 * @author Iván Fernández y Luciano Fattoni
 * @version 1.0.0
 * @since 2025-01-07
 */

const AuditoriaService = require("../services/auditoria.service.js");

/**
 * Middleware que intercepta requests de productos y registra auditorías automáticamente.
 * Solo audita operaciones POST, PUT y PATCH exitosas asociadas a un usuario.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {Function} next - Siguiente middleware.
 * @returns {void}
 */
const auditoriaMiddleware = async (req, res, next) => {
    // Protección extra: nunca auditar DELETE
    if (req.method === "DELETE") {
        return next();
    }
    // Interceptar la respuesta original
    const originalSend = res.send;
    const originalJson = res.json;
    let responseData = null;
    let statusCode = null;
    res.send = function (data) {
        responseData = data;
        statusCode = this.statusCode;
        return originalSend.call(this, data);
    };
    res.json = function (data) {
        responseData = data;
        statusCode = this.statusCode;
        return originalJson.call(this, data);
    };
    res.on("finish", async () => {
        try {
            // Solo auditar si hay usuario y operación exitosa
            if (req.usuario && statusCode >= 200 && statusCode < 300) {
                await procesarAuditoria(req, responseData);
            }
        } catch (error) {
            // Se loguea el error solo si es relevante para la operación
        }
    });
    next();
};

/**
 * Procesa y registra la auditoría basado en la request y la respuesta.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {*} responseData - Datos de la respuesta HTTP.
 * @returns {Promise<void>}
 */
async function procesarAuditoria(req, responseData) {
    const accion = determinarAccion(req.method);
    if (!accion) return; // No auditar GET
    const idProducto = extraerIdProducto(req, responseData);
    if (!idProducto) {
        // No se pudo extraer ID de producto, no se registra auditoría
        return;
    }
    await AuditoriaService.registrarAccion(
        req.usuario.id_usuario,
        accion,
        idProducto
    );
}

/**
 * Determina la acción de auditoría según el método HTTP.
 * @param {string} metodo - Método HTTP (POST, PUT, PATCH).
 * @returns {string|null} Acción de auditoría o null si no corresponde.
 */
function determinarAccion(metodo) {
    switch (metodo) {
        case "POST":
            return "crear";
        case "PUT":
        case "PATCH":
            return "actualizar";
        default:
            return null; // No auditar GET ni otros
    }
}

/**
 * Extrae el ID del producto desde los parámetros de la request o la respuesta.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {*} responseData - Datos de la respuesta HTTP.
 * @returns {number|null} ID del producto o null si no se puede extraer.
 */
function extraerIdProducto(req, responseData) {
    if (req.params.id) {
        return parseInt(req.params.id);
    }
    try {
        if (typeof responseData === "string") {
            responseData = JSON.parse(responseData);
        }
        if (responseData?.producto?.id_producto) {
            return parseInt(responseData.producto.id_producto);
        }
    } catch (error) {
        // Ignorar errores de parsing
    }
    return null;
}

module.exports = auditoriaMiddleware;
