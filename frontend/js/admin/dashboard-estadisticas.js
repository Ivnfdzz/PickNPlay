/**
 * PICK&PLAY - SISTEMA DE ESTADÍSTICAS DEL DASHBOARD
 * 
 * @description Módulo responsable de la recopilación, procesamiento y visualización de
 *              estadísticas del sistema e-commerce. Proporciona métricas clave del negocio
 *              mediante cards informativas y análisis de rendimiento para la toma de decisiones.
 * 
 * @features    - Métricas de auditoría y actividad del sistema
 *              - Estadísticas de usuarios registrados y activos
 *              - Análisis del catálogo de productos
 *              - Métricas de ventas y pedidos realizados
 *              - Top productos más vendidos con ranking
 *              - Consultas paralelas para optimización de rendimiento
 *              - Procesamiento de datos agregados en tiempo real
 *              - Renderizado responsivo de métricas visuales
 * 
 * @business    Las estadísticas proporcionan insights críticos para la gestión del negocio,
 *              permitiendo identificar tendencias, evaluar rendimiento y tomar decisiones
 *              informadas sobre inventario, usuarios y estrategias comerciales.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

/**
 * Recopila y renderiza todas las estadísticas principales del sistema
 * 
 * @async
 * @function mostrarEstadisticas
 * @description Función principal que realiza múltiples consultas paralelas a la API
 *              para obtener datos de diferentes entidades y los procesa para mostrar
 *              métricas relevantes del negocio en formato de cards visuales.
 * @throws {Error} Error en consultas a la API o procesamiento de datos
 * @business Proporciona vista ejecutiva del rendimiento del sistema para toma de decisiones
 */
async function mostrarEstadisticas() {
    try {
        const contenedor = document.getElementById("contenido-dinamico");
        if (contenedor) {
            contenedor.innerHTML = "<div class='text-center my-5'>Cargando estadísticas...</div>";
        }

        // Consultas paralelas para optimización de rendimiento
        const [
            auditoriaStats,
            usuariosStats,
            productos,
            pedidos
        ] = await Promise.all([
            apiInstance.getEstadisticasAuditoria(),
            apiInstance.getEstadisticasUsuarios(),
            apiInstance.getProductos(),
            apiInstance.getPedidos()
        ]);

        // === CORRECCIÓN: Extraer totales correctamente ===
        // Auditoría
        let totalAcciones = 0;
        if (auditoriaStats && (typeof auditoriaStats.total_acciones === 'number' || typeof auditoriaStats.total_acciones === 'string')) {
            totalAcciones = auditoriaStats.total_acciones;
        } else if (Array.isArray(auditoriaStats) && auditoriaStats.length && auditoriaStats[0].total_acciones) {
            totalAcciones = auditoriaStats[0].total_acciones;
        }

        // Usuarios
        let totalUsuarios = 0;
        if (usuariosStats && (typeof usuariosStats.total === 'number' || typeof usuariosStats.total === 'string')) {
            totalUsuarios = usuariosStats.total;
        } else if (typeof usuariosStats === 'number') {
            totalUsuarios = usuariosStats;
        } else if (Array.isArray(usuariosStats) && usuariosStats.length && usuariosStats[0].total) {
            totalUsuarios = usuariosStats[0].total;
        }

        // Total productos y ventas
        const totalProductos = productos.length;
        const totalVentas = pedidos.length;

        // Procesar top 5 productos más vendidos
        const productoVentas = {};
        pedidos.forEach(pedido => {
            if (pedido.DetallePedidos) {
                pedido.DetallePedidos.forEach(det => {
                    const id = det.id_producto;
                    productoVentas[id] = (productoVentas[id] || 0) + det.cantidad;
                });
            }
        });
        // Mapear a nombre de producto
        const productosPorId = {};
        productos.forEach(p => productosPorId[p.id_producto] = p.nombre);
        const topVendidos = Object.entries(productoVentas)
            .map(([id, cantidad]) => ({
                nombre: productosPorId[id] || `ID ${id}`,
                cantidad
            }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5);

        // === Renderizar cards principales ===
        const cardsHTML = `
            <h2 class="mb-4">Estadísticas Generales</h2>
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card text-center h-100">
                        <div class="card-body">
                            <div class="card-title text-muted">Total de acciones</div>
                            <div class="display-5 fw-bold">${totalAcciones}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center h-100">
                        <div class="card-body">
                            <div class="card-title text-muted">Total de usuarios</div>
                            <div class="display-5 fw-bold">${totalUsuarios}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center h-100">
                        <div class="card-body">
                            <div class="card-title text-muted">Total de productos</div>
                            <div class="display-5 fw-bold">${totalProductos}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center h-100">
                        <div class="card-body">
                            <div class="card-title text-muted">Total de ventas</div>
                            <div class="display-5 fw-bold">${totalVentas}</div>
                        </div>
                    </div>
                </div>
            </div>
            <hr>
            <div class="row g-3 mt-2">
                <div class="col-md-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h6 class="card-title mb-3">Acciones por tipo</h6>
                            ${Object.entries(auditoriaStats.acciones_por_tipo || {}).map(([tipo, cant]) =>
                                `<div>${tipo}: <span class="fw-bold">${cant}</span></div>`
                            ).join("")}
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h6 class="card-title mb-3">Usuarios más activos</h6>
                            ${Object.entries(auditoriaStats.usuarios_mas_activos || {})
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([user, cant], i) =>
                                    `<div>${i + 1}. ${user} <span class="fw-bold">(${cant})</span></div>`
                                ).join("")}
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h6 class="card-title mb-3">Productos más modificados</h6>
                            ${Object.entries(auditoriaStats.productos_mas_modificados || {})
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([prod, cant], i) =>
                                    `<div>${i + 1}. ${prod} <span class="fw-bold">(${cant})</span></div>`
                                ).join("")}
                        </div>
                    </div>
                </div>
            </div>
            <hr>
            <div class="row g-3 mt-2">
                <div class="col-md-6">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h6 class="card-title mb-3">Top 5 productos más vendidos</h6>
                            ${topVendidos.length === 0
                                ? "<div class='text-muted'>No hay ventas registradas.</div>"
                                : topVendidos.map((p, i) =>
                                    `<div>${i + 1}. ${p.nombre} <span class="fw-bold">(${p.cantidad})</span></div>`
                                ).join("")}
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h6 class="card-title mb-3">Acciones recientes</h6>
                            ${(auditoriaStats.acciones_recientes || []).slice(0, 5).map(a =>
                                `<div>
                                    <span class="fw-bold">${a.usuario}</span> 
                                    <span class="text-muted">${a.accion}</span> 
                                    <span>${a.producto}</span> 
                                    <span class="text-muted small">${new Date(a.fecha).toLocaleString()}</span>
                                </div>`
                            ).join("")}
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (contenedor) contenedor.innerHTML = cardsHTML;
    } catch (error) {
        const contenedor = document.getElementById("contenido-dinamico");
        if (contenedor) {
            contenedor.innerHTML = `<div class='alert alert-danger'>Error al cargar estadísticas: ${error.message}</div>`;
        }
        console.error("Error mostrando estadísticas:", error);
    }
}

// Exportar globalmente
window.mostrarEstadisticas = mostrarEstadisticas;