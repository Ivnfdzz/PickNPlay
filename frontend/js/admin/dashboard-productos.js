/**
 * PICK&PLAY - SISTEMA DE GESTIÓN DE PRODUCTOS
 * 
 * @description Módulo responsable de la administración completa del catálogo de productos
 *              del e-commerce. Proporciona funcionalidades CRUD completas para la gestión
 *              de productos, incluyendo manejo de imágenes, subcategorías múltiples
 *              y estados de activación.
 * 
 * @features    - Listado completo con búsqueda en tiempo real por nombre
 *              - Creación de productos con carga de imágenes
 *              - Edición completa de productos existentes
 *              - Gestión de relaciones many-to-many con subcategorías
 *              - Control de estado activo/inactivo por producto
 *              - Validaciones exhaustivas de formularios
 *              - Subida y gestión de archivos de imagen
 *              - Búsqueda instantánea con feedback visual
 *              - Eliminación segura con confirmaciones
 * 
 * @business    Los productos son el núcleo del catálogo e-commerce,
 *              requiriendo gestión precisa de información, categorización
 *              adecuada y control de disponibilidad para optimizar ventas.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

/**
 * Obtiene y renderiza la lista completa de productos con funcionalidad de búsqueda
 * 
 * @async
 * @function listarProductos
 * @description Función principal que carga todos los productos del catálogo
 *              y los presenta en una tabla interactiva con búsqueda y acciones CRUD.
 * @throws {Error} Error de comunicación con la API o problemas de renderizado
 * @business Permite a repositores y administradores gestionar el inventario completo
 */
async function listarProductos() {
    try {
        const productos = await apiInstance.getProductos();
        renderizarTablaProductos(productos);

    } catch (error) {
        // 3. Mostrar error con toast
        mostrarToast("Error al cargar productos: " + (error.message || error), "error");
    }
}

/**
 * Renderiza la tabla de productos con funcionalidad de búsqueda y acciones CRUD
 * 
 * @function renderizarTablaProductos
 * @param {Array<Object>} productos - Array de productos con estructura {id_producto, nombre, precio, activo, Subcategorias}
 * @description Genera HTML dinámico para mostrar productos en tabla interactiva
 *              con campo de búsqueda y botones de edición/eliminación por producto
 * @business Facilita la gestión visual del catálogo de productos del sistema
 */
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

/**
 * Muestra el formulario para crear un nuevo producto
 * 
 * @async
 * @function mostrarFormularioCrearProducto
 * @description Carga subcategorías disponibles y genera formulario completo
 *              para crear productos con imagen, precio y asociaciones de subcategorías
 * @business Permite expandir el catálogo de productos disponibles para los clientes
 */
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
                    <label for="imagen" class="form-label">Imagen</label>
                    <input type="file" class="form-control" id="imagen" name="imagen" accept="image/*" required>
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
                const descripcion = form.descripcion.value.trim();
                const activo = form.activo.checked;

                // 2. Tomar los IDs de las subcategorías seleccionadas
                const subcatCheckboxes = form.querySelectorAll('input[name="subcategorias"]:checked');
                const subcategorias = Array.from(subcatCheckboxes).map(cb => parseInt(cb.value));

                // 3. Validar campos requeridos
                const imagenInput = form.imagen;
                if (!nombre || isNaN(precio) || !imagenInput.files[0] || subcategorias.length === 0) {
                    mostrarToast("Por favor, completá todos los campos obligatorios y seleccioná al menos una subcategoría.", "warning");
                    return;
                }

                // 4. Armar FormData para enviar archivo y datos
                const formData = new FormData();
                formData.append("nombre", nombre);
                formData.append("precio", precio);
                formData.append("imagen", imagenInput.files[0]);
                formData.append("descripcion", descripcion);
                formData.append("activo", activo);
                subcategorias.forEach(id => formData.append("subcategorias[]", id));

                // 5. Llamar a la API para crear el producto
                try {
                    await apiInstance.crearProducto(formData, true); // true indica que es FormData
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

/**
 * Muestra el formulario para editar un producto existente
 * 
 * @async
 * @function mostrarFormularioEditarProducto
 * @param {number} id - ID del producto a editar
 * @description Carga datos del producto y subcategorías, genera formulario pre-poblado
 *              para edición completa incluyendo imagen y asociaciones de subcategorías
 * @business Permite mantener actualizado el catálogo de productos con cambios de precio, descripción y categorización
 */
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
                    <label for="imagen" class="form-label">Imagen</label>
                    <input type="file" class="form-control" id="imagen" name="imagen" accept="image/*">
                    <div class="form-text">Dejar vacío para mantener la imagen actual.</div>
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
                const descripcion = form.descripcion.value.trim();
                const activo = form.activo.checked;

                // 2. Tomar los IDs de las subcategorías seleccionadas
                const subcatCheckboxes = form.querySelectorAll('input[name="subcategorias"]:checked');
                const subcategorias = Array.from(subcatCheckboxes).map(cb => parseInt(cb.value));

                // 3. Validar campos requeridos
                if (!nombre || isNaN(precio) || subcategorias.length === 0) {
                    mostrarToast("Por favor, completá todos los campos obligatorios y seleccioná al menos una subcategoría.", "warning");
                    return;
                }

                // 4. Armar FormData para enviar archivo y datos
                const formData = new FormData();
                formData.append("nombre", nombre);
                formData.append("precio", precio);
                formData.append("descripcion", descripcion);
                formData.append("activo", activo);
                subcategorias.forEach(id => formData.append("subcategorias[]", id));
                const imagenInput = form.imagen;
                if (imagenInput.files[0]) {
                    formData.append("imagen", imagenInput.files[0]);
                }

                // 5. Llamar a la API para actualizar el producto
                try {
                    await apiInstance.actualizarProducto(id, formData, true); // true indica que es FormData
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

/**
 * Elimina un producto después de confirmación del usuario
 * 
 * @async
 * @function eliminarProducto
 * @param {number} id - ID del producto a eliminar
 * @description Solicita confirmación y elimina el producto especificado del catálogo
 * @business Permite remover productos descontinuados o erróneos del inventario
 */
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

/**
 * Busca productos por nombre utilizando el campo de búsqueda
 * 
 * @async
 * @function buscarProductosPorNombre
 * @param {string} nombre - Término de búsqueda para filtrar productos
 * @description Filtra productos por nombre o muestra todos si el campo está vacío
 * @business Facilita la localización rápida de productos específicos en el catálogo
 */
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