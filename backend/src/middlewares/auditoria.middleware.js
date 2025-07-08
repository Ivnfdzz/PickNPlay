const AuditoriaService = require("../services/auditoria.service.js");

/**
 * Middleware que intercepta requests de productos y registra auditorías automáticamente
 */
const auditoriaMiddleware = async (req, res, next) => {
    // Protección extra: nunca auditar DELETE
    if (req.method === "DELETE") {
        return next();
    }

    // PASO 1: Interceptar la respuesta original
    const originalSend = res.send;
    const originalJson = res.json;

    // PASO 2: Variables para capturar datos
    let responseData = null;
    let statusCode = null;

    // PASO 3: Interceptar res.send()
    res.send = function (data) {
        responseData = data;
        statusCode = this.statusCode;
        return originalSend.call(this, data);
    };

    // PASO 4: Interceptar res.json()
    res.json = function (data) {
        responseData = data;
        statusCode = this.statusCode;
        return originalJson.call(this, data);
    };

    // PASO 5: Escuchar cuando la respuesta termine
    res.on("finish", async () => {
        try {
            // PASO 6: Solo auditar si hay usuario y operación exitosa
            if (req.usuario && statusCode >= 200 && statusCode < 300) {
                await procesarAuditoria(req, responseData);
            }
        } catch (error) {
            console.error("Error en auditoría:", error.message);
        }
    });

    // PASO 7: Continuar con el siguiente middleware/controller
    next();
};

/**
 * Procesa y registra la auditoría basado en la request
 */
async function procesarAuditoria(req, responseData) {
    // PASO 1: Determinar qué acción se realizó
    const accion = determinarAccion(req.method);

    if (!accion) return; // No auditar GET

    // PASO 2: Extraer ID del producto
    const idProducto = extraerIdProducto(req, responseData);

    if (!idProducto) {
        console.warn("⚠️ No se pudo extraer ID del producto para auditoría");
        return;
    }

    // PASO 3: Registrar en AuditoriaService
    await AuditoriaService.registrarAccion(
        req.usuario.id_usuario,
        accion,
        idProducto
    );
}

/**
 * Determina qué acción se realizó basado en el método HTTP
 */
function determinarAccion(metodo) {
    switch (metodo) {
        case "POST":
            return "crear";
        case "PUT":
            return "actualizar";
        case "PATCH":
            return "actualizar";
        default:
            return null; // No auditar GET
    }
}

/**
 * Extrae el ID del producto desde params o response
 */
function extraerIdProducto(req, responseData) {
    // OPCIÓN 1: Desde parámetros de URL (PUT /productos/5, DELETE /productos/5)
    if (req.params.id) {
        return parseInt(req.params.id);
    }

    // OPCIÓN 2: Desde respuesta de creación (POST /productos)
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
