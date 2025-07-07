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
