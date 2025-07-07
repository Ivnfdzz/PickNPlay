async function listarMetodosPago() {
    try {
        const metodos = await apiInstance.getMetodosPago();
        renderizarTablaMetodosPago(metodos);
    } catch (error) {
        mostrarToast(
            "Error al cargar métodos de pago: " + (error.message || error),
            "error"
        );
    }
}

function renderizarTablaMetodosPago(metodos) {
    const contenedor = document.getElementById("contenido-dinamico");
    if (!contenedor) return;

    let html = `
        <h2 class="mb-4">Listado de Métodos de Pago</h2>
        <div class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Activo</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (!metodos || metodos.length === 0) {
        html += `
            <tr>
                <td colspan="3" class="text-center text-muted">No hay métodos de pago registrados.</td>
            </tr>
        `;
    } else {
        metodos.forEach((metodo) => {
            html += `
                <tr>
                    <td>${metodo.nombre}</td>
                    <td>${metodo.activo ? "Sí" : "No"}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-primary me-2" onclick="mostrarFormularioEditarMetodoPago(${
                            metodo.id_metodopago
                        })">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarMetodoPago(${
                            metodo.id_metodopago
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

async function mostrarFormularioCrearMetodoPago() {
    try {
        const contenedor = document.getElementById("contenido-dinamico");
        if (!contenedor) return;

        const formHTML = `
            <h2 class="mb-4">Crear nuevo método de pago</h2>
            <form id="form-crear-metodopago" autocomplete="off">
                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="nombre" name="nombre" required>
                </div>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="activo" name="activo" checked>
                    <label class="form-check-label" for="activo">Activo</label>
                </div>
                <button type="submit" class="btn btn-primary">Crear método de pago</button>
            </form>
        `;

        contenedor.innerHTML = formHTML;

        const form = document.getElementById("form-crear-metodopago");
        if (form) {
            form.addEventListener("submit", async function (e) {
                e.preventDefault();

                const nombre = form.nombre.value.trim();
                const activo = form.activo.checked;

                if (!nombre) {
                    mostrarToast("Por favor, completá el nombre.", "warning");
                    return;
                }

                const metodoPago = { nombre, activo };

                try {
                    await apiInstance.crearMetodoPago(metodoPago);
                    mostrarToast(
                        "Método de pago creado exitosamente.",
                        "success"
                    );
                    setTimeout(() => {
                        listarMetodosPago();
                    }, 1200);
                } catch (error) {
                    mostrarToast(
                        "Error al crear método de pago: " +
                            (error.message || error),
                        "error"
                    );
                }
            });
        }
    } catch (error) {
        mostrarToast(
            "Error al cargar el formulario: " + (error.message || error),
            "error"
        );
    }
}

async function mostrarFormularioEditarMetodoPago(id) {
    try {
        // 1. Traer datos del método de pago
        const metodo = await apiInstance.getMetodoPago(id);

        // 2. Seleccionar el contenedor central
        const contenedor = document.getElementById("contenido-dinamico");
        if (!contenedor) return;

        // 3. Armar el HTML del formulario
        const formHTML = `
            <h2 class="mb-4">Modificar método de pago</h2>
            <form id="form-editar-metodopago" autocomplete="off">
                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="nombre" name="nombre" value="${
                        metodo.nombre || ""
                    }" required>
                </div>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="activo" name="activo" ${
                        metodo.activo ? "checked" : ""
                    }>
                    <label class="form-check-label" for="activo">Activo</label>
                </div>
                <button type="submit" class="btn btn-primary">Guardar cambios</button>
                <button type="button" class="btn btn-secondary ms-2" onclick="listarMetodosPago()">Cancelar</button>
            </form>
        `;

        contenedor.innerHTML = formHTML;

        // 4. Event listener al formulario
        const form = document.getElementById("form-editar-metodopago");
        if (form) {
            form.addEventListener("submit", async function (e) {
                e.preventDefault();

                const nombre = form.nombre.value.trim();
                const activo = form.activo.checked;

                if (!nombre) {
                    mostrarToast("Por favor, completá el nombre.", "warning");
                    return;
                }

                const metodoEditado = { nombre, activo };

                try {
                    await apiInstance.actualizarMetodoPago(id, metodoEditado);
                    mostrarToast(
                        "Método de pago actualizado exitosamente.",
                        "success"
                    );
                    setTimeout(() => {
                        listarMetodosPago();
                    }, 1200);
                } catch (error) {
                    mostrarToast(
                        "Error al actualizar método de pago: " +
                            (error.message || error),
                        "error"
                    );
                }
            });
        }
    } catch (error) {
        mostrarToast(
            "Error al cargar el formulario de edición: " +
                (error.message || error),
            "error"
        );
    }
}

async function eliminarMetodoPago(id) {
    try {
        const confirmado = confirm("¿Desea eliminar este método de pago?");
        if (!confirmado) return;

        await apiInstance.eliminarMetodoPago(id);
        mostrarToast("Método de pago eliminado exitosamente.", "success");
        listarMetodosPago();
    } catch (error) {
        mostrarToast(
            "Error al eliminar método de pago: " + (error.message || error),
            "error"
        );
    }
}

// Exportar globalmente para el core
window.listarMetodosPago = listarMetodosPago;
window.mostrarFormularioCrearMetodoPago = mostrarFormularioCrearMetodoPago;
window.mostrarFormularioEditarMetodoPago = mostrarFormularioEditarMetodoPago;
window.eliminarMetodoPago = eliminarMetodoPago;
