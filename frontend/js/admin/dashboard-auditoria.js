async function listarLogsAuditoria() {
    try {
        // 1. Traer logs desde la API (por defecto, últimos 50)
        const respuesta = await apiInstance.getLogs({ limite: 50 });
        const logs = respuesta.logs || [];

        renderizarCardsLogs(logs);
    } catch (error) {
        if (!error.message?.toLowerCase().includes("denegado") && !error.message?.toLowerCase().includes("autorización")) {
            mostrarToast("Error al cargar logs de auditoría: " + (error.message || error), "error");
        }
    }
}

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

// Exportar globalmente
window.listarLogsAuditoria = listarLogsAuditoria;