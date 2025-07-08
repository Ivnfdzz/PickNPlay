/**
 * PICK&PLAY - SISTEMA DE AUDITORÍA DEL DASHBOARD
 * 
 * @description Módulo responsable de la visualización y gestión de logs de auditoría
 *              del sistema administrativo. Proporciona herramientas para revisar y
 *              monitorear todas las acciones realizadas por los usuarios en el sistema,
 *              facilitando el control y seguimiento de actividades críticas.
 * 
 * @features    - Listado de logs de auditoría con limitación optimizada
 *              - Renderizado en formato de cards responsivas
 *              - Manejo especializado de productos eliminados
 *              - Formateo automático de fechas y datos de usuario
 *              - Gestión robusta de errores con feedback visual
 *              - Filtrado inteligente de errores de autorización
 * 
 * @business    Los logs de auditoría son fundamentales para el control administrativo,
 *              permitiendo rastrear cambios, identificar responsables y mantener
 *              la integridad del sistema mediante un registro completo de actividades.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

/**
 * Obtiene y renderiza los logs de auditoría del sistema
 * 
 * @async
 * @function listarLogsAuditoria
 * @description Función principal que carga los logs de auditoría más recientes
 *              y los presenta en formato de cards organizadas. Optimiza el rendimiento
 *              limitando a 50 registros por defecto y maneja errores de autorización.
 * @throws {Error} Error de comunicación con la API o problemas de renderizado
 * @business Permite a administradores y analistas revisar la actividad del sistema para auditorías
 */
async function listarLogsAuditoria() {
    try {
        const respuesta = await apiInstance.getLogs({ limite: 50 });
        const logs = respuesta.logs || [];

        renderizarCardsLogs(logs);
    } catch (error) {
        if (!error.message?.toLowerCase().includes("denegado") && !error.message?.toLowerCase().includes("autorización")) {
            mostrarToast("Error al cargar logs de auditoría: " + (error.message || error), "error");
        }
    }
}


/**
 * Renderiza los logs de auditoría en formato de cards responsivas
 * 
 * @function renderizarCardsLogs
 * @param {Array<Object>} logs - Array de objetos log de auditoría con estructura {id, accion, usuario, producto, fecha_hora}
 * @description Genera HTML dinámico para mostrar logs en formato de cards organizadas
 *              en una grilla responsiva. Maneja casos especiales como productos eliminados
 *              y usuarios sin información completa, proporcionando contexto visual claro.
 * @business Facilita la revisión rápida de actividades del sistema con formato visual amigable
 */
function renderizarCardsLogs(logs) {
    const contenedor = document.getElementById("contenido-dinamico");
    if (!contenedor) return;

    let html = `
        <h2 class="mb-4">Logs de Auditoría</h2>
        <div class="row g-3">
    `;

    if (!logs || logs.length === 0) {
        html += `<div class="col-12 text-muted text-center">No hay logs registrados.</div>`;
    } else {
        logs.forEach(log => {
            // Procesamiento especializado para productos eliminados
            let productoStr = "-";
            if (log.producto) {
                if (
                    log.producto.nombre &&
                    log.producto.nombre.toLowerCase().includes("eliminado") &&
                    log.producto.id
                ) {
                    productoStr = `Producto eliminado (ID: ${log.producto.id})`;
                } else if (log.producto.nombre) {
                    productoStr = log.producto.nombre;
                }
            }
            
            html += `
                <div class="col-md-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h6 class="card-title mb-2">
                                <i class="bi bi-activity me-2 text-primary"></i>
                                ${log.accion?.nombre || "Acción"}
                            </h6>
                            <p class="mb-0"><strong>ID Log:</strong> ${log.id}</p>
                            <p class="mb-1"><strong>Usuario:</strong> ${log.usuario?.username || "-"} (${log.usuario?.email || "-"})</p>
                            <p class="mb-1"><strong>Producto:</strong> ${productoStr}</p>
                            <p class="mb-1"><strong>Fecha:</strong> ${new Date(log.fecha_hora).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;
    contenedor.innerHTML = html;
}

// Exportación global para integración con el core del dashboard
window.listarLogsAuditoria = listarLogsAuditoria;