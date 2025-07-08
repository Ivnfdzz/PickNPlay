/**
 * PICK&PLAY - SISTEMA DE GESTIÓN DE MÉTODOS DE PAGO
 * 
 * @description Módulo responsable de la administración completa de métodos de pago
 *              disponibles en el sistema e-commerce. Permite a los administradores
 *              gestionar las opciones de pago que tendrán disponibles los clientes
 *              durante el proceso de compra.
 * 
 * @features    - Listado completo de métodos de pago configurados
 *              - Creación de nuevos métodos de pago
 *              - Edición de métodos existentes (nombre y estado)
 *              - Eliminación de métodos obsoletos
 *              - Control de activación/desactivación de métodos
 *              - Validación de campos requeridos
 *              - Confirmaciones de seguridad antes de eliminaciones
 * 
 * @security    Solo usuarios con rol 'root' pueden crear/eliminar métodos.
 *              Todos los roles pueden ver la lista de métodos disponibles.
 * 
 * @business    Los métodos de pago son fundamentales para el proceso de venta,
 *              permitiendo configurar las opciones disponibles para los clientes
 *              y adaptarse a diferentes necesidades del mercado.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

/**
 * Obtiene y renderiza la lista completa de métodos de pago
 * 
 * @async
 * @function listarMetodosPago
 * @description Función principal que carga todos los métodos de pago configurados
 *              y los presenta en una tabla con opciones de edición y eliminación.
 * @throws {Error} Error de comunicación con la API o problemas de renderizado
 * @business Permite a administradores revisar y gestionar las opciones de pago disponibles
 */
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

/**
 * Renderiza la tabla de métodos de pago con opciones de administración
 * 
 * @function renderizarTablaMetodosPago
 * @param {Array<Object>} metodos - Array de métodos de pago con estructura {id_metodopago, nombre, activo}
 * @description Genera HTML dinámico para mostrar métodos de pago en tabla
 *              con botones de edición y eliminación para cada registro
 * @business Facilita la gestión visual de opciones de pago disponibles en el sistema
 */
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

/**
 * Muestra el formulario para crear un nuevo método de pago
 * 
 * @async
 * @function mostrarFormularioCrearMetodoPago
 * @description Genera y configura un formulario para crear métodos de pago
 *              con validación de campos y manejo de envío asíncrono
 * @business Permite expandir las opciones de pago disponibles para los clientes
 */
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

/**
 * Muestra el formulario para editar un método de pago existente
 * 
 * @async
 * @function mostrarFormularioEditarMetodoPago
 * @param {number} id - ID del método de pago a editar
 * @description Carga datos del método de pago y genera formulario pre-poblado
 *              para edición con validación y manejo de actualización
 * @business Permite mantener actualizadas las opciones de pago del sistema
 */
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

/**
 * Elimina un método de pago después de confirmación del usuario
 * 
 * @async
 * @function eliminarMetodoPago
 * @param {number} id - ID del método de pago a eliminar
 * @description Solicita confirmación y elimina el método de pago especificado
 * @business Permite remover opciones de pago obsoletas o no utilizadas
 */
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
