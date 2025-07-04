// ========== VARIABLES GLOBALES ==========
let categoriaActual = null;
let subcategoriaActual = null;
let productosData = [];
let subcategoriasData = [];
let carritoItems = [];

// ========== ELEMENTOS DEL DOM ==========
const elementos = {
    // Sidebar
    categoriaTitulo: document.getElementById("categoria-titulo"),
    subcategoriasList: document.getElementById("subcategorias-list"),

    // Content area
    tituloSeccion: document.getElementById("titulo-seccion"),
    subtituloSeccion: document.getElementById("subtitulo-seccion"),
    productosContainer: document.getElementById("productos-container"),
    loadingContainer: document.getElementById("loading-container"),
    noProductos: document.getElementById("no-productos"),

    // Navbar
    saludoCliente: document.getElementById("saludo-cliente"),
    contadorCarrito: document.getElementById("contador-carrito"),
    btnCarrito: document.getElementById("btn-carrito"),
    backButton: document.getElementById("backButton"),
};

// ========== INICIALIZACIÓN ==========
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🎮 Inicializando página de productos...");

    // Verificar datos del localStorage
    if (!verificarDatosIniciales()) {
        return; // Se redirige automáticamente
    }

    // Configurar UI inicial
    configurarUIInicial();

    // Configurar eventos
    configurarEventos();

    // Cargar datos desde la API
    await cargarDatosIniciales();
});

// ========== VERIFICACIÓN Y CONFIGURACIÓN INICIAL ==========
function verificarDatosIniciales() {
    const nombreCliente = localStorage.getItem("nombreCliente");
    const categoriaId = localStorage.getItem("categoriaSeleccionada");
    const categoriaNombre = localStorage.getItem("nombreCategoria");

    if (!nombreCliente) {
        console.error("❌ No hay nombre de cliente");
        mostrarToast("Debes ingresar tu nombre primero", "error");
        setTimeout(() => {
            window.location.href = "/frontend/html/index.html";
        }, 2000);
        return false;
    }

    if (!categoriaId || !categoriaNombre) {
        console.error("❌ No hay categoría seleccionada");
        mostrarToast("Debes seleccionar una categoría primero", "error");
        setTimeout(() => {
            window.location.href = "/frontend/html/categorias.html";
        }, 2000);
        return false;
    }

    // Guardar datos globalmente
    categoriaActual = {
        id: categoriaId,
        nombre: categoriaNombre,
    };

    console.log(
        `✅ Datos válidos - Cliente: ${nombreCliente}, Categoría: ${categoriaNombre}`
    );
    return true;
}

function configurarUIInicial() {
    const nombreCliente = localStorage.getItem("nombreCliente");

    // Mostrar saludo personalizado
    if (elementos.saludoCliente) {
        elementos.saludoCliente.textContent = `¡Hola, ${nombreCliente}!`;
    }

    // Mostrar categoría en sidebar
    if (elementos.categoriaTitulo) {
        elementos.categoriaTitulo.textContent = categoriaActual.nombre;
    }

    // Configurar título principal
    if (elementos.tituloSeccion) {
        elementos.tituloSeccion.textContent = `${categoriaActual.nombre}`;
    }

    // Inicializar contador de carrito
    actualizarContadorCarrito();
}

function configurarEventos() {
    // Botón de volver
    if (elementos.backButton) {
        elementos.backButton.addEventListener("click", () => {
            window.history.back();
        });
    }

    // Botón del carrito (redirigir a carrito.html)
    if (elementos.btnCarrito) {
        elementos.btnCarrito.addEventListener("click", () => {
            // Guardar carrito en localStorage antes de redirigir
            localStorage.setItem("carrito", JSON.stringify(carritoItems));
            window.location.href = "/frontend/html/carrito.html";
        });
    }
}

// ========== CARGA DE DATOS DESDE API ==========
async function cargarDatosIniciales() {
    try {
        mostrarLoading(true);

        // Cargar subcategorías de la categoría seleccionada
        console.log(
            `🔄 Cargando subcategorías para categoría ${categoriaActual.id}`
        );
        await cargarSubcategorias();

        // Cargar todos los productos de la categoría
        console.log(
            `🔄 Cargando productos para categoría ${categoriaActual.id}`
        );
        await cargarProductos();

        // Mostrar productos inicialmente (todos)
        mostrarProductos(productosData);

        console.log("✅ Datos cargados correctamente");
    } catch (error) {
        console.error("❌ Error cargando datos:", error);
        mostrarToast("Error cargando productos. Intenta nuevamente.", "error");
        mostrarErrorCarga();
    } finally {
        mostrarLoading(false);
    }
}

async function cargarSubcategorias() {
    try {
        subcategoriasData = await apiInstance.getSubcategoriasPorCategoria(
            categoriaActual.id
        );
        console.log(`✅ ${subcategoriasData.length} subcategorías cargadas`);

        // Renderizar subcategorías en el sidebar
        renderizarSubcategorias();
    } catch (error) {
        console.error("❌ Error cargando subcategorías:", error);
        throw error;
    }
}

async function cargarProductos() {
    try {
        const response = await apiInstance.getProductosPorCategoria(
            categoriaActual.id
        );
        productosData = response.productos || [];

        console.log(`✅ ${productosData.length} productos cargados`);

        if (productosData.length === 0) {
            mostrarMensajeSinProductos();
        }
    } catch (error) {
        console.error("❌ Error cargando productos:", error);
        throw error;
    }
}

// ========== RENDERIZADO DE SUBCATEGORÍAS ==========
function renderizarSubcategorias() {
    if (!elementos.subcategoriasList) return;

    // Limpiar subcategorías existentes (mantener botón "Todos")
    const todosButton = elementos.subcategoriasList.querySelector(
        '[data-subcategoria-id=""]'
    );
    elementos.subcategoriasList.innerHTML = "";

    // Re-agregar botón "Todos"
    if (todosButton) {
        elementos.subcategoriasList.appendChild(todosButton);
    }

    // Agregar subcategorías
    subcategoriasData.forEach((subcategoria) => {
        const button = crearBotonSubcategoria(subcategoria);
        elementos.subcategoriasList.appendChild(button);
    });

    // Configurar eventos de subcategorías
    configurarEventosSubcategorias();
}

function crearBotonSubcategoria(subcategoria) {
    const button = document.createElement("button");
    button.className =
        "list-group-item list-group-item-action subcategoria-item";
    button.setAttribute("data-subcategoria-id", subcategoria.id_subcategoria);

    button.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-tag-fill me-3 text-secondary"></i>
            <span>${subcategoria.nombre}</span>
        </div>
    `;

    return button;
}

function configurarEventosSubcategorias() {
    const botonesSubcategoria =
        elementos.subcategoriasList.querySelectorAll(".subcategoria-item");

    botonesSubcategoria.forEach((boton) => {
        boton.addEventListener("click", () => {
            const subcategoriaId = boton.getAttribute("data-subcategoria-id");
            seleccionarSubcategoria(subcategoriaId, boton);
        });
    });
}

function seleccionarSubcategoria(subcategoriaId, botonClickeado) {
    // Remover clase active de todos los botones
    const todosBotones =
        elementos.subcategoriasList.querySelectorAll(".subcategoria-item");
    todosBotones.forEach((btn) => btn.classList.remove("active"));

    // Agregar clase active al botón clickeado
    botonClickeado.classList.add("active");

    // Filtrar productos
    if (subcategoriaId === "") {
        // Mostrar todos los productos
        subcategoriaActual = null;
        elementos.tituloSeccion.textContent = categoriaActual.nombre;
        elementos.subtituloSeccion.textContent = "Todos los productos";
        mostrarProductos(productosData);
        console.log("🔄 Mostrando todos los productos");
    } else {
        // Filtrar por subcategoría
        const subcategoria = subcategoriasData.find(
            (s) => s.id_subcategoria == subcategoriaId
        );
        if (subcategoria) {
            subcategoriaActual = subcategoria;
            elementos.tituloSeccion.textContent = subcategoria.nombre;
            elementos.subtituloSeccion.textContent = `${categoriaActual.nombre} > ${subcategoria.nombre}`;

            const productosFiltrados =
                filtrarProductosPorSubcategoria(subcategoriaId);
            mostrarProductos(productosFiltrados);
            console.log(`🔄 Mostrando productos de: ${subcategoria.nombre}`);
        }
    }
}

function filtrarProductosPorSubcategoria(subcategoriaId) {
    return productosData.filter((producto) => {
        return (
            producto.subcategorias &&
            producto.subcategorias.some(
                (sub) => sub.id_subcategoria == subcategoriaId
            )
        );
    });
}

// ========== RENDERIZADO DE PRODUCTOS ==========
function mostrarProductos(productos) {
    if (!elementos.productosContainer) return;

    elementos.productosContainer.innerHTML = "";
    elementos.noProductos.classList.add("d-none");

    if (productos.length === 0) {
        mostrarMensajeSinProductos();
        return;
    }

    productos.forEach((producto) => {
        const card = crearTarjetaProducto(producto);
        elementos.productosContainer.appendChild(card);
    });

    console.log(`✅ ${productos.length} productos mostrados`);
}

function crearTarjetaProducto(producto) {
    const col = document.createElement("div");
    col.className = "col-md-4 col-lg-3";

    // Formatear precio
    const precioFormateado = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
    }).format(producto.precio);

    col.innerHTML = `
        <div class="card producto-card h-100" data-producto-id="${
            producto.id_producto
        }">
            <img src="/frontend/img/productos/${producto.imagen}" 
                    class="card-img-top" 
                    alt="${producto.nombre}"
                    onerror="this.src='/frontend/img/productos/default.jpg'">
            <div class="card-body d-flex flex-column">
                <h6 class="card-title">${producto.nombre}</h6>
                <p class="card-text text-muted small flex-grow-1">${
                    producto.descripcion || "Sin descripción"
                }</p>
                
                <!-- Precio -->
                <div class="producto-precio mb-3 text-center">
                    ${precioFormateado}
                </div>
                
                <!-- Selector de cantidad -->
                <div class="cantidad-selector mb-3">
                    <button class="cantidad-btn" onclick="cambiarCantidad(${
                        producto.id_producto
                    }, -1)">
                        <i class="bi bi-dash"></i>
                    </button>
                    <input type="number" 
                            class="cantidad-input" 
                            id="cantidad-${producto.id_producto}" 
                            value="1" 
                            min="1" 
                            max="10"
                            readonly>
                    <button class="cantidad-btn" onclick="cambiarCantidad(${
                        producto.id_producto
                    }, 1)">
                        <i class="bi bi-plus"></i>
                    </button>
                </div>
                
                <!-- Botón agregar al carrito -->
                <button class="btn btn-agregar-carrito w-100" 
                        onclick="agregarAlCarrito(${producto.id_producto})">
                    <i class="bi bi-cart-plus me-2"></i>
                    Agregar al carrito
                </button>
            </div>
        </div>
    `;

    return col;
}

// ========== FUNCIONES GLOBALES PARA ONCLICK ==========
window.cambiarCantidad = function (productoId, cambio) {
    const input = document.getElementById(`cantidad-${productoId}`);
    if (!input) return;

    let cantidad = parseInt(input.value) + cambio;
    cantidad = Math.max(1, Math.min(10, cantidad)); // Entre 1 y 10

    input.value = cantidad;

    // Feedback táctil visual
    const card = document.querySelector(`[data-producto-id="${productoId}"]`);
    if (card) {
        card.style.transform = "scale(1.02)";
        setTimeout(() => {
            card.style.transform = "scale(1)";
        }, 150);
    }
};

window.agregarAlCarrito = function (productoId) {
    const producto = productosData.find((p) => p.id_producto == productoId);
    if (!producto) {
        console.error("❌ Producto no encontrado:", productoId);
        return;
    }

    const cantidadInput = document.getElementById(`cantidad-${productoId}`);
    const cantidad = parseInt(cantidadInput.value) || 1;

    // Verificar si el producto ya está en el carrito
    const itemExistente = carritoItems.find(
        (item) => item.id_producto == productoId
    );

    if (itemExistente) {
        // Actualizar cantidad
        itemExistente.cantidad += cantidad;
    } else {
        // Agregar nuevo item
        carritoItems.push({
            id_producto: producto.id_producto,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: cantidad,
        });
    }

    // Feedback visual y sonoro
    mostrarFeedbackAgregarCarrito(productoId, producto.nombre, cantidad);

    // Actualizar contador
    actualizarContadorCarrito();

    // Reset cantidad a 1
    cantidadInput.value = 1;

    console.log(`✅ ${producto.nombre} (${cantidad}) agregado al carrito`);
};

function mostrarFeedbackAgregarCarrito(productoId, nombre, cantidad) {
    // Feedback visual en la card
    const card = document.querySelector(`[data-producto-id="${productoId}"]`);
    if (card) {
        card.classList.add("border-success");
        setTimeout(() => {
            card.classList.remove("border-success");
        }, 1000);
    }

    // Toast de confirmación
    mostrarToast(`${nombre} (${cantidad}) agregado al carrito`, "success");

    // Animación del botón carrito
    if (elementos.btnCarrito) {
        elementos.btnCarrito.style.transform = "scale(1.1)";
        setTimeout(() => {
            elementos.btnCarrito.style.transform = "scale(1)";
        }, 200);
    }
}

function actualizarContadorCarrito() {
    const totalItems = carritoItems.reduce(
        (total, item) => total + item.cantidad,
        0
    );

    if (elementos.contadorCarrito) {
        elementos.contadorCarrito.textContent = totalItems;

        // Mostrar/ocultar badge
        if (totalItems > 0) {
            elementos.contadorCarrito.classList.remove("d-none");
        } else {
            elementos.contadorCarrito.classList.add("d-none");
        }
    }
}

// ========== ESTADOS DE UI ==========
function mostrarLoading(mostrar) {
    if (!elementos.loadingContainer) return;

    if (mostrar) {
        elementos.loadingContainer.classList.remove("d-none");
        elementos.productosContainer.classList.add("d-none");
        elementos.noProductos.classList.add("d-none");
    } else {
        elementos.loadingContainer.classList.add("d-none");
        elementos.productosContainer.classList.remove("d-none");
    }
}

function mostrarMensajeSinProductos() {
    if (elementos.noProductos) {
        elementos.noProductos.classList.remove("d-none");
        elementos.productosContainer.classList.add("d-none");
    }
}

function mostrarErrorCarga() {
    if (elementos.productosContainer) {
        elementos.productosContainer.innerHTML = `
            <div class="col-12">
                <div class="text-center p-5">
                    <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 3rem;"></i>
                    <h4 class="mt-3 text-danger">Error cargando productos</h4>
                    <p class="text-muted">No se pudieron cargar los productos. Verifica tu conexión.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="bi bi-arrow-clockwise me-2"></i>
                        Reintentar
                    </button>
                </div>
            </div>
        `;
    }
}

// ========== SISTEMA DE TOASTS ==========
function mostrarToast(mensaje, tipo = "info") {
    // Crear contenedor si no existe
    let toastContainer = document.querySelector(".toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.className =
            "toast-container position-fixed top-0 end-0 p-3";
        document.body.appendChild(toastContainer);
    }

    // Determinar clases según el tipo
    const tipoClases = {
        success: "bg-success text-white",
        error: "bg-danger text-white",
        warning: "bg-warning text-dark",
        info: "bg-info text-white",
    };

    const clases = tipoClases[tipo] || tipoClases.info;

    // Crear toast
    const toastId = `toast-${Date.now()}`;
    const toastHTML = `
        <div class="toast ${clases}" id="${toastId}" role="alert">
            <div class="toast-body">
                <i class="bi bi-${getIconoTipo(tipo)} me-2"></i>
                ${mensaje}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML("beforeend", toastHTML);

    // Mostrar toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: tipo === "error" ? 4000 : 3000,
    });

    toast.show();

    // Remover después de ocultar
    toastElement.addEventListener("hidden.bs.toast", () => {
        toastElement.remove();
    });
}

function getIconoTipo(tipo) {
    const iconos = {
        success: "check-circle-fill",
        error: "exclamation-triangle-fill",
        warning: "exclamation-triangle-fill",
        info: "info-circle-fill",
    };
    return iconos[tipo] || iconos.info;
}

// ========== UTILIDADES ==========
function limpiarCarrito() {
    carritoItems = [];
    actualizarContadorCarrito();
    localStorage.removeItem("carrito");
}

// Exponer funciones globales necesarias
window.limpiarCarrito = limpiarCarrito;

console.log("🎮 productos.js cargado correctamente");
