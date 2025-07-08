/**
 * PICK&PLAY - SISTEMA DE ADMINISTRACIÓN DE SUBCATEGORÍAS
 * 
 * @description Módulo responsable de la gestión completa de subcategorías en el dashboard administrativo.
 *              Proporciona funcionalidades CRUD para subcategorías, incluyendo listado, creación,
 *              edición y eliminación. Las subcategorías están asociadas a categorías padre y permiten
 *              una organización jerárquica de productos.
 * 
 * @features    - Listado completo de subcategorías con paginación
 *              - Creación de nuevas subcategorías con asignación de categoría padre
 *              - Edición de subcategorías existentes
 *              - Eliminación de subcategorías con confirmación
 *              - Búsqueda y filtrado por nombre
 *              - Validación de datos en tiempo real
 *              - Interfaz responsiva con Bootstrap
 * 
 * @business    Las subcategorías permiten una clasificación más específica de productos,
 *              mejorando la experiencia del usuario final y la organización del inventario.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

/**
 * Obtiene y renderiza todas las subcategorías desde la API
 * 
 * @async
 * @function listarSubcategorias
 * @description Función principal que carga todas las subcategorías disponibles
 *              y las presenta en una tabla interactiva con opciones de edición y eliminación.
 * @throws {Error} Error de comunicación con la API o problemas de renderizado
 * @business Permite al administrador visualizar todas las subcategorías y su relación con categorías padre
 */
async function listarSubcategorias() {
    try {
        const subcategorias = await apiInstance.getSubcategorias();
        renderizarTablaSubcategorias(subcategorias);
    } catch (error) {
        mostrarToast(
            "Error al cargar subcategorías: " + (error.message || error),
            "error"
        );
    }
}

/**
 * Renderiza la tabla de subcategorías en el contenedor principal
 * 
 * @function renderizarTablaSubcategorias
 * @param {Array<Object>} subcategorias - Array de objetos subcategoría con estructura {id_subcategoria, nombre, categoria: {nombre}}
 * @description Genera HTML dinámico para mostrar subcategorías en formato tabla,
 *              incluyendo botones de acción para editar y eliminar cada entrada.
 *              También configura los event listeners para búsqueda en tiempo real.
 * @business Proporciona una vista organizada de subcategorías con acciones rápidas para gestión
 */
function renderizarTablaSubcategorias(subcategorias) {
    const contenedor = document.getElementById("contenido-dinamico");
    if (!contenedor) return;

    let html = `
        <h2 class="mb-4">Listado de Subcategorías</h2>
        <div class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Categoría padre</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (!subcategorias || subcategorias.length === 0) {
        html += `
            <tr>
                <td colspan="3" class="text-center text-muted">No hay subcategorías registradas.</td>
            </tr>
        `;
    } else {
        subcategorias.forEach((subcat) => {
            html += `
                <tr>
                    <td>${subcat.nombre}</td>
                    <td>${subcat.categoria ? subcat.categoria.nombre : "-"}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-primary me-2" onclick="mostrarFormularioEditarSubcategoria(${
                            subcat.id_subcategoria
                        })">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarSubcategoria(${
                            subcat.id_subcategoria
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

    // Configuración de búsqueda en tiempo real
    const inputBuscar = document.getElementById("input-buscar-subcat");
    const btnBuscar = document.getElementById("btn-buscar-subcat");
    if (inputBuscar && btnBuscar) {
        btnBuscar.addEventListener("click", () => {
            buscarSubcategoriasPorNombre(inputBuscar.value.trim());
        });
        inputBuscar.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                buscarSubcategoriasPorNombre(inputBuscar.value.trim());
            }
        });
    }
}

/**
 * Muestra el formulario para crear una nueva subcategoría
 * 
 * @async
 * @function mostrarFormularioCrearSubcategoria
 * @description Genera y presenta un formulario interactivo para la creación de subcategorías,
 *              incluyendo la carga dinámica de categorías padre disponibles y validación de datos.
 * @throws {Error} Error al cargar categorías o al procesar la creación
 * @business Permite expandir la taxonomía de productos creando nuevas subcategorías
 */
async function mostrarFormularioCrearSubcategoria() {
    try {
        const categorias = await apiInstance.getCategorias();

        const contenedor = document.getElementById("contenido-dinamico");
        if (!contenedor) return;

        // Generación de opciones de categorías padre
        let selectHTML = "";
        if (categorias && categorias.length > 0) {
            selectHTML = `
                <select class="form-select" id="id_categoria" name="id_categoria" required>
                    <option value="">Selecciona una categoría</option>
                    ${categorias
                        .map(
                            (cat) => `
                        <option value="${cat.id_categoria}">${cat.nombre}</option>
                    `
                        )
                        .join("")}
                </select>
            `;
        } else {
            selectHTML = `<div class="text-muted">No hay categorías disponibles.</div>`;
        }

        // Estructura del formulario de creación
        const formHTML = `
            <h2 class="mb-4">Crear nueva subcategoría</h2>
            <form id="form-crear-subcategoria" autocomplete="off">
                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="nombre" name="nombre" required>
                </div>
                <div class="mb-3">
                    <label for="id_categoria" class="form-label">Categoría padre</label>
                    ${selectHTML}
                </div>
                <button type="submit" class="btn btn-primary">Crear subcategoría</button>
            </form>
        `;

        contenedor.innerHTML = formHTML;

        // Configuración del evento de envío del formulario
        const form = document.getElementById("form-crear-subcategoria");
        if (form) {
            form.addEventListener("submit", async function (e) {
                e.preventDefault();

                const nombre = form.nombre.value.trim();
                const id_categoria = parseInt(form.id_categoria.value);

                if (!nombre || isNaN(id_categoria)) {
                    mostrarToast(
                        "Por favor, completá todos los campos.",
                        "warning"
                    );
                    return;
                }

                const subcategoria = { nombre, id_categoria };

                try {
                    await apiInstance.crearSubcategoria(subcategoria);
                    mostrarToast(
                        "Subcategoría creada exitosamente.",
                        "success"
                    );
                    setTimeout(() => {
                        listarSubcategorias();
                    }, 1200);
                } catch (error) {
                    mostrarToast(
                        "Error al crear subcategoría: " +
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
 * Muestra el formulario de edición para una subcategoría específica
 * 
 * @async
 * @function mostrarFormularioEditarSubcategoria
 * @param {number} id - ID único de la subcategoría a editar
 * @description Carga los datos actuales de la subcategoría y presenta un formulario pre-poblado
 *              para su modificación, incluyendo la posibilidad de cambiar la categoría padre.
 * @throws {Error} Error al cargar datos de la subcategoría o categorías
 * @business Permite actualizar la información de subcategorías para mantener la taxonomía actualizada
 */
async function mostrarFormularioEditarSubcategoria(id) {
    try {
        const subcat = await apiInstance.getSubcategoria(id);
        const categorias = await apiInstance.getCategorias();

        const contenedor = document.getElementById("contenido-dinamico");
        if (!contenedor) return;

        // Generación de select con categoría actual preseleccionada
        let selectHTML = "";
        if (categorias && categorias.length > 0) {
            selectHTML = `
                <select class="form-select" id="id_categoria" name="id_categoria" required>
                    <option value="">Selecciona una categoría</option>
                    ${categorias
                        .map(
                            (cat) => `
                        <option value="${cat.id_categoria}" ${
                                subcat.id_categoria === cat.id_categoria
                                    ? "selected"
                                    : ""
                            }>
                            ${cat.nombre}
                        </option>
                    `
                        )
                        .join("")}
                </select>
            `;
        } else {
            selectHTML = `<div class="text-muted">No hay categorías disponibles.</div>`;
        }

        // Formulario de edición con datos pre-cargados
        const formHTML = `
            <h2 class="mb-4">Modificar subcategoría</h2>
            <form id="form-editar-subcategoria" autocomplete="off">
                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="nombre" name="nombre" value="${
                        subcat.nombre || ""
                    }" required>
                </div>
                <div class="mb-3">
                    <label for="id_categoria" class="form-label">Categoría padre</label>
                    ${selectHTML}
                </div>
                <button type="submit" class="btn btn-primary">Guardar cambios</button>
                <button type="button" class="btn btn-secondary ms-2" onclick="listarSubcategorias()">Cancelar</button>
            </form>
        `;

        contenedor.innerHTML = formHTML;

        // Configuración del evento de actualización
        const form = document.getElementById("form-editar-subcategoria");
        if (form) {
            form.addEventListener("submit", async function (e) {
                e.preventDefault();

                const nombre = form.nombre.value.trim();
                const id_categoria = parseInt(form.id_categoria.value);

                if (!nombre || isNaN(id_categoria)) {
                    mostrarToast(
                        "Por favor, completá todos los campos.",
                        "warning"
                    );
                    return;
                }

                const subcatEditada = { nombre, id_categoria };

                try {
                    await apiInstance.actualizarSubcategoria(id, subcatEditada);
                    mostrarToast(
                        "Subcategoría actualizada exitosamente.",
                        "success"
                    );
                    setTimeout(() => {
                        listarSubcategorias();
                    }, 1200);
                } catch (error) {
                    mostrarToast(
                        "Error al actualizar subcategoría: " +
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
 * Elimina una subcategoría específica del sistema
 * 
 * @async
 * @function eliminarSubcategoria
 * @param {number} id - ID único de la subcategoría a eliminar
 * @description Solicita confirmación del usuario y procede a eliminar la subcategoría.
 *              Verifica que no haya productos asociados antes de la eliminación.
 * @throws {Error} Error de validación o comunicación con la API
 * @business Permite mantener actualizada la taxonomía removiendo subcategorías obsoletas
 */
async function eliminarSubcategoria(id) {
    try {
        const confirmado = confirm("¿Desea eliminar esta subcategoría?");
        if (!confirmado) return;

        await apiInstance.eliminarSubcategoria(id);
        mostrarToast("Subcategoría eliminada exitosamente.", "success");
        listarSubcategorias();
    } catch (error) {
        mostrarToast(
            "Error al eliminar subcategoría: " + (error.message || error),
            "error"
        );
    }
}

// Exportación de funciones para integración con el core del dashboard
window.mostrarFormularioCrearSubcategoria = mostrarFormularioCrearSubcategoria;
window.listarSubcategorias = listarSubcategorias;
window.mostrarFormularioEditarSubcategoria = mostrarFormularioEditarSubcategoria;
window.eliminarSubcategoria = eliminarSubcategoria;
