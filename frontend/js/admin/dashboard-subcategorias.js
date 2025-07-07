async function listarSubcategorias() {
    try {
        // 1. Traer subcategorías desde la API
        const subcategorias = await apiInstance.getSubcategorias();

        // 2. Renderizar tabla
        renderizarTablaSubcategorias(subcategorias);

    } catch (error) {
        mostrarToast("Error al cargar subcategorías: " + (error.message || error), "error");
    }
}

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
        subcategorias.forEach(subcat => {
            html += `
                <tr>
                    <td>${subcat.nombre}</td>
                    <td>${subcat.categoria ? subcat.categoria.nombre : "-"}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-2" onclick="mostrarFormularioEditarSubcategoria(${subcat.id_subcategoria})">
                            Modificar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarSubcategoria(${subcat.id_subcategoria})">
                            Eliminar
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

    // Event listener para buscar
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

async function mostrarFormularioCrearSubcategoria() {
    try {
        // 1. Traer categorías desde la API
        const categorias = await apiInstance.getCategorias();

        // 2. Seleccionar el contenedor central
        const contenedor = document.getElementById("contenido-dinamico");
        if (!contenedor) return;

        // 3. Armar el select de categorías
        let selectHTML = "";
        if (categorias && categorias.length > 0) {
            selectHTML = `
                <select class="form-select" id="id_categoria" name="id_categoria" required>
                    <option value="">Selecciona una categoría</option>
                    ${categorias.map(cat => `
                        <option value="${cat.id_categoria}">${cat.nombre}</option>
                    `).join("")}
                </select>
            `;
        } else {
            selectHTML = `<div class="text-muted">No hay categorías disponibles.</div>`;
        }

        // 4. Armar el HTML del formulario
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

        // 5. Renderizar el formulario
        contenedor.innerHTML = formHTML;

        // 6. Event listener al formulario
        const form = document.getElementById("form-crear-subcategoria");
        if (form) {
            form.addEventListener("submit", async function (e) {
                e.preventDefault();

                const nombre = form.nombre.value.trim();
                const id_categoria = parseInt(form.id_categoria.value);

                if (!nombre || isNaN(id_categoria)) {
                    mostrarToast("Por favor, completá todos los campos.", "warning");
                    return;
                }

                const subcategoria = { nombre, id_categoria };

                try {
                    await apiInstance.crearSubcategoria(subcategoria);
                    mostrarToast("Subcategoría creada exitosamente.", "success");
                    setTimeout(() => {
                        listarSubcategorias();
                    }, 1200);
                } catch (error) {
                    mostrarToast("Error al crear subcategoría: " + (error.message || error), "error");
                }
            });
        }
    } catch (error) {
        mostrarToast("Error al cargar el formulario: " + (error.message || error), "error");
    }
}

async function mostrarFormularioEditarSubcategoria(id) {
    try {
        // 1. Traer datos de la subcategoría
        const subcat = await apiInstance.getSubcategoria(id);

        // 2. Traer todas las categorías
        const categorias = await apiInstance.getCategorias();

        // 3. Seleccionar el contenedor central
        const contenedor = document.getElementById("contenido-dinamico");
        if (!contenedor) return;

        // 4. Armar el select de categorías, marcando la actual
        let selectHTML = "";
        if (categorias && categorias.length > 0) {
            selectHTML = `
                <select class="form-select" id="id_categoria" name="id_categoria" required>
                    <option value="">Selecciona una categoría</option>
                    ${categorias.map(cat => `
                        <option value="${cat.id_categoria}" ${subcat.id_categoria === cat.id_categoria ? "selected" : ""}>
                            ${cat.nombre}
                        </option>
                    `).join("")}
                </select>
            `;
        } else {
            selectHTML = `<div class="text-muted">No hay categorías disponibles.</div>`;
        }

        // 5. Armar el HTML del formulario
        const formHTML = `
            <h2 class="mb-4">Modificar subcategoría</h2>
            <form id="form-editar-subcategoria" autocomplete="off">
                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="nombre" name="nombre" value="${subcat.nombre || ""}" required>
                </div>
                <div class="mb-3">
                    <label for="id_categoria" class="form-label">Categoría padre</label>
                    ${selectHTML}
                </div>
                <button type="submit" class="btn btn-primary">Guardar cambios</button>
                <button type="button" class="btn btn-secondary ms-2" onclick="listarSubcategorias()">Cancelar</button>
            </form>
        `;

        // 6. Renderizar el formulario
        contenedor.innerHTML = formHTML;

        // 7. Event listener al formulario
        const form = document.getElementById("form-editar-subcategoria");
        if (form) {
            form.addEventListener("submit", async function (e) {
                e.preventDefault();

                const nombre = form.nombre.value.trim();
                const id_categoria = parseInt(form.id_categoria.value);

                if (!nombre || isNaN(id_categoria)) {
                    mostrarToast("Por favor, completá todos los campos.", "warning");
                    return;
                }

                const subcatEditada = { nombre, id_categoria };

                try {
                    await apiInstance.actualizarSubcategoria(id, subcatEditada);
                    mostrarToast("Subcategoría actualizada exitosamente.", "success");
                    setTimeout(() => {
                        listarSubcategorias();
                    }, 1200);
                } catch (error) {
                    mostrarToast("Error al actualizar subcategoría: " + (error.message || error), "error");
                }
            });
        }
    } catch (error) {
        mostrarToast("Error al cargar el formulario de edición: " + (error.message || error), "error");
    }
};

async function eliminarSubcategoria(id) {
    try {
        const confirmado = confirm("¿Desea eliminar esta subcategoría?");
        if (!confirmado) return;

        await apiInstance.eliminarSubcategoria(id);
        mostrarToast("Subcategoría eliminada exitosamente.", "success");
        listarSubcategorias();
    } catch (error) {
        mostrarToast("Error al eliminar subcategoría: " + (error.message || error), "error");
    }
};

// Exportar globalmente para el core
window.mostrarFormularioCrearSubcategoria = mostrarFormularioCrearSubcategoria;
window.listarSubcategorias = listarSubcategorias;
window.mostrarFormularioEditarSubcategoria = mostrarFormularioEditarSubcategoria;
window.eliminarSubcategoria = eliminarSubcategoria;