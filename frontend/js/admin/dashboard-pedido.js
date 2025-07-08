/**
 * PICK&PLAY - SISTEMA DE GESTIÓN DE PEDIDOS
 * 
 * @description Módulo responsable de la administración y visualización de pedidos
 *              realizados en el sistema e-commerce. Proporciona herramientas completas
 *              para que los administradores puedan revisar, analizar y gestionar
 *              todas las ventas del sistema.
 * 
 * @features    - Listado completo de pedidos con información resumida
 *              - Vista detallada de pedidos individuales con productos
 *              - Información completa de clientes y métodos de pago
 *              - Cálculos automáticos de totales y subtotales
 *              - Eliminación de pedidos con confirmación de seguridad
 *              - Navegación fluida entre listado y detalles
 *              - Formateo de fechas y montos para mejor legibilidad
 * 
 * @security    Solo roles 'root' y 'analista' pueden visualizar pedidos.
 *              Solo 'root' puede eliminar pedidos del sistema.
 *              Los pedidos se crean únicamente desde el frontend cliente.
 * 
 * @business    Los pedidos representan el núcleo del negocio e-commerce,
 *              permitiendo el seguimiento de ventas, análisis de tendencias
 *              y gestión de la relación con clientes.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

/**
 * Obtiene y renderiza la lista completa de pedidos del sistema
 * 
 * @async
 * @function listarPedidos
 * @description Función principal que carga todos los pedidos realizados
 *              y los presenta en una tabla con información resumida y acciones disponibles.
 * @throws {Error} Error de comunicación con la API o problemas de renderizado
 * @business Permite a administradores y analistas revisar el historial completo de ventas
 */
async function listarPedidos() {
    try {
        const pedidos = await apiInstance.getPedidos();
        renderizarTablaPedidos(pedidos);
    } catch (error) {
        mostrarToast(
            "Error al cargar pedidos: " + (error.message || error),
            "error"
        );
    }
}

/**
 * Renderiza la tabla de pedidos con información resumida y acciones
 * 
 * @function renderizarTablaPedidos
 * @param {Array<Object>} pedidos - Array de pedidos con estructura {id_pedido, fecha, nombre_cliente, MetodoPago, total, DetallePedidos}
 * @description Genera HTML dinámico para mostrar pedidos en tabla
 *              con información de cliente, método de pago, total y acciones de visualización/eliminación
 * @business Facilita la gestión y revisión del historial de ventas del sistema
 */
function renderizarTablaPedidos(pedidos) {
    const contenedor = document.getElementById("contenido-dinamico");
    if (!contenedor) return;

    let html = `
        <h2 class="mb-4">Listado de Pedidos</h2>
        <div class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Método de Pago</th>
                        <th>Total</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (!pedidos || pedidos.length === 0) {
        html += `
            <tr>
                <td colspan="6" class="text-center text-muted">No hay pedidos registrados.</td>
            </tr>
        `;
    } else {
        pedidos.forEach((pedido) => {
            html += `
                <tr>
                    <td>${pedido.id_pedido}</td>
                    <td>${new Date(pedido.fecha).toLocaleString()}</td>
                    <td>${pedido.nombre_cliente}</td>
                    <td>${
                        pedido.MetodoPago
                            ? pedido.MetodoPago.nombre
                            : pedido.id_metodopago
                    }</td>
                    <td>$${pedido.total.toFixed(2)}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-info me-2" onclick="verDetallePedido(${
                            pedido.id_pedido
                        })">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarPedido(${
                            pedido.id_pedido
                        })">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    html += `
                </tbody>
            </table>
        </div>
    `;

    contenedor.innerHTML = html;
}

/**
 * Muestra el detalle completo de un pedido específico
 * 
 * @async
 * @function verDetallePedido
 * @param {number} id - ID del pedido a visualizar
 * @description Carga y muestra información detallada del pedido incluyendo
 *              datos del cliente, método de pago, total y listado de productos
 * @business Permite revisar en detalle las ventas realizadas para análisis y seguimiento
 */
async function verDetallePedido(id) {
    try {
        const pedido = await apiInstance.getPedido(id);
        const contenedor = document.getElementById("contenido-dinamico");
        if (!contenedor) return;

        // Info general
        let html = `
            <h2 class="mb-4">Detalle del Pedido #${pedido.id_pedido}</h2>
            <div class="mb-3">
                <strong>Fecha:</strong> ${new Date(
                    pedido.fecha
                ).toLocaleString()}<br>
                <strong>Cliente:</strong> ${pedido.nombre_cliente}<br>
                <strong>Método de Pago:</strong> ${
                    pedido.MetodoPago
                        ? pedido.MetodoPago.nombre
                        : pedido.id_metodopago
                }<br>
                <strong>Total:</strong> $${pedido.total.toFixed(2)}
            </div>
        `;

        // Tabla de productos
        if (pedido.DetallePedidos && pedido.DetallePedidos.length > 0) {
            html += `
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio unitario</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            pedido.DetallePedidos.forEach((det) => {
                html += `
                    <tr>
                        <td>${
                            det.Producto ? det.Producto.nombre : det.id_producto
                        }</td>
                        <td>${det.cantidad}</td>
                        <td>$${det.precio_unitario.toFixed(2)}</td>
                        <td>$${(det.cantidad * det.precio_unitario).toFixed(
                            2
                        )}</td>
                    </tr>
                `;
            });
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            html += `<div class="text-muted">No hay productos en este pedido.</div>`;
        }

        html += `
            <button class="btn btn-secondary mt-3" onclick="listarPedidos()">Volver al listado</button>
        `;

        contenedor.innerHTML = html;
    } catch (error) {
        mostrarToast(
            "Error al cargar el detalle del pedido: " +
                (error.message || error),
            "error"
        );
    }
}

/**
 * Elimina un pedido después de confirmación del usuario
 * 
 * @async
 * @function eliminarPedido
 * @param {number} id - ID del pedido a eliminar
 * @description Solicita confirmación y elimina el pedido especificado del sistema
 * @business Permite remover pedidos erróneos o cancelados del historial de ventas
 */
async function eliminarPedido(id) {
    try {
        const confirmado = confirm("¿Desea eliminar este pedido?");
        if (!confirmado) return;

        await apiInstance.eliminarPedido(id);
        mostrarToast("Pedido eliminado exitosamente.", "success");
        listarPedidos();
    } catch (error) {
        mostrarToast(
            "Error al eliminar pedido: " + (error.message || error),
            "error"
        );
    }
}

// Exportar globalmente para el core
window.listarPedidos = listarPedidos;
window.verDetallePedido = verDetallePedido;
window.eliminarPedido = eliminarPedido;
