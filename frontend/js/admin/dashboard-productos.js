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
        <div class="mb-3">
            <div class="input-group">
                <input type="text" id="input-buscar-producto" class="form-control" placeholder="Buscar por nombre...">
                <button class="btn btn-outline-primary" id="btn-buscar-producto">
                    <i class="bi bi-search"></i> Buscar
                </button>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Subcategorías</th>
                        <th>Activo</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (!productos || productos.length === 0) {
        html += `
            <tr>
                <td colspan="4" class="text-center text-muted">No hay productos registrados.</td>
            </tr>
        `;
    } else {
        productos.forEach(producto => {
            const subcats = (producto.subcategorias || [])
                .map(sub => sub.nombre)
                .join(", ");

            html += `
                <tr>
                    <td>${producto.nombre}</td>
                    <td>$${producto.precio.toFixed(2)}</td>
                    <td>${subcats}</td>
                    <td>${producto.activo ? "Sí" : "No"}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-primary me-2" onclick="mostrarFormularioEditarProducto(${producto.id_producto})" title="Modificar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.id_producto})" title="Eliminar">
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

    const inputBuscar = document.getElementById("input-buscar-producto");
    const btnBuscar = document.getElementById("btn-buscar-producto");
    if (inputBuscar && btnBuscar) {
        btnBuscar.addEventListener("click", () => {
            buscarProductosPorNombre(inputBuscar.value.trim());
        });
        inputBuscar.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                buscarProductosPorNombre(inputBuscar.value.trim());
            }
        });
    }
}

async function mostrarFormularioCrearProducto() {
    try {
        // 1. Traer subcategorías desde la API
        const subcategorias = await apiInstance.getSubcategorias();

        // 2. Seleccionar el contenedor central
        const contenedor = document.getElementById("contenido-dinamico");
        if (!contenedor) return;

        // 3. Armar los checkboxes de subcategorías
        let checkboxesHTML = "";
        if (subcategorias && subcategorias.length > 0) {
            checkboxesHTML = subcategorias.map(subcat => `
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" 
                        id="subcat-${subcat.id_subcategoria}" 
                        name="subcategorias" 
                        value="${subcat.id_subcategoria}">
                    <label class="form-check-label" for="subcat-${subcat.id_subcategoria}">
                        ${subcat.nombre}
                    </label>
                </div>
            `).join("");
        } else {
            checkboxesHTML = `<div class="text-muted">No hay subcategorías disponibles.</div>`;
        }

        // 4. Armar el HTML del formulario
        const formHTML = `
            <h2 class="mb-4">Crear nuevo producto</h2>
            <form id="form-crear-producto" autocomplete="off">
                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="nombre" name="nombre" required>
                </div>
                <div class="mb-3">
                    <label for="precio" class="form-label">Precio</label>
                    <input type="number" class="form-control" id="precio" name="precio" min="0" step="0.01" required>
                </div>
                <div class="mb-3">
                    <label for="imagen" class="form-label">Imagen (URL o nombre de archivo)</label>
                    <input type="text" class="form-control" id="imagen" name="imagen" required>
                </div>
                <div class="mb-3">
                    <label for="descripcion" class="form-label">Descripción</label>
                    <textarea class="form-control" id="descripcion" name="descripcion" rows="3"></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Subcategorías</label>
                    <div>
                        ${checkboxesHTML}
                    </div>
                </div>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="activo" name="activo" checked>
                    <label class="form-check-label" for="activo">Activo</label>
                </div>
                <button type="submit" class="btn btn-primary">Crear producto</button>
            </form>
        `;

        // 5. Renderizar el formulario en el área central
        contenedor.innerHTML = formHTML;

        // 6. Agregar event listener al formulario (por ahora solo previene submit)
        const form = document.getElementById("form-crear-producto");
        if (form) {
            form.addEventListener("submit", async function (e) {
                e.preventDefault();

                // 1. Tomar los valores de los campos
                const nombre = form.nombre.value.trim();
                const precio = parseFloat(form.precio.value);
                const imagen = form.imagen.value.trim();
                const descripcion = form.descripcion.value.trim();
                const activo = form.activo.checked;

                // 2. Tomar los IDs de las subcategorías seleccionadas
                const subcatCheckboxes = form.querySelectorAll('input[name="subcategorias"]:checked');
                const subcategorias = Array.from(subcatCheckboxes).map(cb => parseInt(cb.value));

                // 3. Validar campos requeridos
                if (!nombre || isNaN(precio) || !imagen || subcategorias.length === 0) {
                    mostrarToast("Por favor, completá todos los campos obligatorios y seleccioná al menos una subcategoría.", "warning");
                    return;
                }

                // 4. Armar el objeto producto
                const producto = {
                    nombre,
                    precio,
                    imagen,
                    descripcion,
                    activo,
                    subcategorias
                };

                // 5. Llamar a la API para crear el producto
                try {
                    await apiInstance.crearProducto(producto);
                    mostrarToast("Producto creado exitosamente.", "success");
                    // Volver al listado después de un breve delay
                    setTimeout(() => {
                        listarProductos();
                    }, 1200);
                } catch (error) {
                    mostrarToast("Error al crear producto: " + (error.message || error), "error");
                }
            });
        }

    } catch (error) {
        mostrarToast("Error al cargar el formulario: " + (error.message || error), "error");
    }


}

async function mostrarFormularioEditarProducto(id) {
    try {
        // 1. Traer los datos del producto por id
        const producto = await apiInstance.getProducto(id);

        // 2. Traer todas las subcategorías
        const subcategorias = await apiInstance.getSubcategorias();

        // 3. Seleccionar el contenedor central
        const contenedor = document.getElementById("contenido-dinamico");
        if (!contenedor) return;

        // 4. Armar los checkboxes de subcategorías, marcando las que ya tiene el producto
        let checkboxesHTML = "";
        const subcatIds = (producto.subcategorias || []).map(sub => sub.id_subcategoria);
        if (subcategorias && subcategorias.length > 0) {
            checkboxesHTML = subcategorias.map(subcat => `
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" 
                        id="subcat-${subcat.id_subcategoria}-edit" 
                        name="subcategorias" 
                        value="${subcat.id_subcategoria}"
                        ${subcatIds.includes(subcat.id_subcategoria) ? "checked" : ""}>
                    <label class="form-check-label" for="subcat-${subcat.id_subcategoria}-edit">
                        ${subcat.nombre}
                    </label>
                </div>
            `).join("");
        } else {
            checkboxesHTML = `<div class="text-muted">No hay subcategorías disponibles.</div>`;
        }

        // 5. Armar el HTML del formulario de edición
        const formHTML = `
            <h2 class="mb-4">Modificar producto</h2>
            <form id="form-editar-producto" autocomplete="off">
                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="nombre" name="nombre" value="${producto.nombre || ""}" required>
                </div>
                <div class="mb-3">
                    <label for="precio" class="form-label">Precio</label>
                    <input type="number" class="form-control" id="precio" name="precio" min="0" step="0.01" value="${producto.precio || ""}" required>
                </div>
                <div class="mb-3">
                    <label for="imagen" class="form-label">Imagen (URL o nombre de archivo)</label>
                    <input type="text" class="form-control" id="imagen" name="imagen" value="${producto.imagen || ""}" required>
                </div>
                <div class="mb-3">
                    <label for="descripcion" class="form-label">Descripción</label>
                    <textarea class="form-control" id="descripcion" name="descripcion" rows="3">${producto.descripcion || ""}</textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Subcategorías</label>
                    <div>
                        ${checkboxesHTML}
                    </div>
                </div>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="activo" name="activo" ${producto.activo ? "checked" : ""}>
                    <label class="form-check-label" for="activo">Activo</label>
                </div>
                <button type="submit" class="btn btn-primary">Guardar cambios</button>
                <button type="button" class="btn btn-secondary ms-2" onclick="listarProductos()">Cancelar</button>
            </form>
        `;

        // 6. Renderizar el formulario en el área central
        contenedor.innerHTML = formHTML;

        // 7. Agregar event listener al formulario (por ahora solo previene submit)
        const form = document.getElementById("form-editar-producto");
        if (form) {
            form.addEventListener("submit", async function (e) {
                e.preventDefault();

                // 1. Tomar los valores de los campos
                const nombre = form.nombre.value.trim();
                const precio = parseFloat(form.precio.value);
                const imagen = form.imagen.value.trim();
                const descripcion = form.descripcion.value.trim();
                const activo = form.activo.checked;

                // 2. Tomar los IDs de las subcategorías seleccionadas
                const subcatCheckboxes = form.querySelectorAll('input[name="subcategorias"]:checked');
                const subcategorias = Array.from(subcatCheckboxes).map(cb => parseInt(cb.value));

                // 3. Validar campos requeridos
                if (!nombre || isNaN(precio) || !imagen || subcategorias.length === 0) {
                    mostrarToast("Por favor, completá todos los campos obligatorios y seleccioná al menos una subcategoría.", "warning");
                    return;
                }

                // 4. Armar el objeto producto
                const productoEditado = {
                    nombre,
                    precio,
                    imagen,
                    descripcion,
                    activo,
                    subcategorias
                };

                // 5. Llamar a la API para actualizar el producto
                try {
                    console.log("Editando producto id:", id, "con data:", productoEditado);
                    await apiInstance.actualizarProducto(id, productoEditado);
                    mostrarToast("Producto actualizado exitosamente.", "success");
                    setTimeout(() => {
                        listarProductos();
                    }, 1200);
                } catch (error) {
                    mostrarToast("Error al actualizar producto: " + (error.message || error), "error");
                }
            });
        }

    } catch (error) {
        mostrarToast("Error al cargar el formulario de edición: " + (error.message || error), "error");
    }
}

async function eliminarProducto(id) {
    try {
        const confirmado = confirm("¿Desea eliminar este producto?");
        if (!confirmado) return;

        await apiInstance.eliminarProducto(id);
        
        mostrarToast("Producto eliminado exitosamente.", "success");
        // Actualizar el listado
        listarProductos();
    } catch (error) {
        mostrarToast("Error al eliminar producto: " + (error.message || error), "error");
    }
}

async function buscarProductosPorNombre(nombre) {
    try {
        if (!nombre) {
            // Si el input está vacío, mostrar todos
            listarProductos();
            return;
        }
        const productos = await apiInstance.buscarProducto(nombre);
        renderizarTablaProductos(productos);
    } catch (error) {
        mostrarToast("Error al buscar productos: " + (error.message || error), "error");
    }
}

window.listarProductos = listarProductos;
window.mostrarFormularioCrearProducto = mostrarFormularioCrearProducto;
window.mostrarFormularioEditarProducto = mostrarFormularioEditarProducto;
window.eliminarProducto = eliminarProducto;
window.buscarProductosPorNombre = buscarProductosPorNombre;