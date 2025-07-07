async function listarProductos() {
    try {
        // 1. Traer productos desde la API
        const productos = await apiInstance.getProductos();

        // 2. Renderizar tabla
        renderizarTablaProductos(productos);

    } catch (error) {
        // 3. Mostrar error con toast
        mostrarToast("Error al cargar productos: " + (error.message || error), "error");
    }
}

function renderizarTablaProductos(productos) {
    // Seleccionamos el contenedor central
    const contenedor = document.getElementById("contenido-dinamico");
    if (!contenedor) return;

    // Armamos el HTML de la tabla
    let html = `
        <h2 class="mb-4">Listado de Productos</h2>
        <div class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Subcategorías</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (!productos || productos.length === 0) {
        html += `
            <tr>
                <td colspan="3" class="text-center text-muted">No hay productos registrados.</td>
            </tr>
        `;
    } else {
        productos.forEach(producto => {
            // Subcategorías como string separado por coma
            const subcats = (producto.subcategorias || [])
                .map(sub => sub.nombre)
                .join(", ");

            html += `
                <tr>
                    <td>${producto.nombre}</td>
                    <td>$${producto.precio.toFixed(2)}</td>
                    <td>${subcats}</td>
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

// Exportar para usar en otros módulos si hace falta
window.listarProductos = listarProductos;