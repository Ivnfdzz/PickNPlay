// VARIABLES GLOBALES
let categoriaActual = null;
let subcategoriaActual = null;
let productosData = [];
let subcategoriasData = [];
let carritoItems = [];

// ELEMENTOS DEL DOM
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

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Inicializando página de productos...");

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

// VERIFICACIÓN Y CONFIGURACIÓN INICIAL
function verificarDatosIniciales() {
    const nombreCliente = localStorage.getItem("nombreCliente");
    const categoriaId = localStorage.getItem("categoriaSeleccionada");
    const categoriaNombre = localStorage.getItem("nombreCategoria");

    if (!nombreCliente) {
        console.error("No hay nombre de cliente");
        mostrarToast("Debes ingresar tu nombre primero", "error");
        setTimeout(() => {
            window.location.href = "/frontend/html/index.html";
        }, 2000);
        return false;
    }

    if (!categoriaId || !categoriaNombre) {
        console.error("No hay categoría seleccionada");
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

    cargarCarritoDesdeLocalStorage();

    console.log(
        `Datos válidos - Cliente: ${nombreCliente}, Categoría: ${categoriaNombre}`
    );
    return true;
}

function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    
    if (carritoGuardado) {
        try {
            carritoItems = JSON.parse(carritoGuardado);
            console.log(`Carrito restaurado: ${carritoItems.length} items`);

            // Mostrar detalle de lo que se cargó
            carritoItems.forEach(item => {
                console.log(`  - ${item.nombre} (${item.cantidad})`);
            });
        } catch (error) {
            console.error('Error parseando carrito:', error);
            carritoItems = [];
            localStorage.removeItem('carrito');
        }
    } else {
        carritoItems = [];
        console.log('Carrito vacío - empezando nuevo');
    }
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

// CARGA DE DATOS DESDE API
async function cargarDatosIniciales() {
    try {
        mostrarLoading(true);

        await cargarSubcategorias();
        await cargarProductos();

        mostrarProductos(productosData);

        console.log(" Datos cargados correctamente");
    } catch (error) {
        console.error("Error cargando datos:", error);
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
        console.log(`${subcategoriasData.length} subcategorías cargadas`);

        // Renderizar subcategorías en el sidebar
        renderizarSubcategorias();
    } catch (error) {
        console.error("Error cargando subcategorías:", error);
        throw error;
    }
}

async function cargarProductos() {
    try {
        const response = await apiInstance.getProductosPorCategoria(categoriaActual.id);
        
        // ✅ DEPURAR: Ver qué devuelve la API
        console.log(" Respuesta completa de la API:", response);
        console.log(" Productos en respuesta:", response.productos);
        
        productosData = response.productos || [];

        // ✅ DEPURAR: Ver estructura de cada producto
        if (productosData.length > 0) {
            console.log(" Primer producto:", productosData[0]);
            console.log(" Subcategorías del primer producto:", productosData[0].subcategorias);
        }

        console.log(` ${productosData.length} productos cargados`);
    } catch (error) {
        console.error(" Error cargando productos:", error);
        throw error;
    }
}

// RENDERIZADO DE SUBCATEGORÍAS
function renderizarSubcategorias() {
    if (!elementos.subcategoriasList) return;

    // Limpiar subcategorías existentes
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
    console.log(`Seleccionando subcategoría: ${subcategoriaId}`);
    
    // Remover clase active de todos los botones
    const todosBotones = elementos.subcategoriasList.querySelectorAll(".subcategoria-item");
    todosBotones.forEach((btn) => btn.classList.remove("active"));

    // Agregar clase active al botón clickeado
    botonClickeado.classList.add("active");

    // Filtrar productos
    if (subcategoriaId === "" || subcategoriaId === null || subcategoriaId === undefined) {
        // MOSTRAR TODOS - Verificar que productosData tenga datos
        console.log(`Mostrando TODOS los productos (${productosData.length})`);
        subcategoriaActual = null;
        elementos.tituloSeccion.textContent = categoriaActual.nombre;
        elementos.subtituloSeccion.textContent = "Todos los productos";
        mostrarProductos(productosData);
    } else {
        const subcategoria = subcategoriasData.find(
            (s) => s.id_subcategoria == subcategoriaId
        );
        
        if (subcategoria) {
            console.log(`Filtrando por: ${subcategoria.nombre}`);
            subcategoriaActual = subcategoria;
            elementos.tituloSeccion.textContent = subcategoria.nombre;
            elementos.subtituloSeccion.textContent = `${categoriaActual.nombre} > ${subcategoria.nombre}`;

            const productosFiltrados = filtrarProductosPorSubcategoria(subcategoriaId);
            mostrarProductos(productosFiltrados);
        } else {
            console.error(`Subcategoría no encontrada: ${subcategoriaId}`);
        }
    }
}

function filtrarProductosPorSubcategoria(subcategoriaId) {
    console.log(`Filtrando por subcategoría ID: ${subcategoriaId}`);
    console.log(`Total productos disponibles: ${productosData.length}`);
    
    const productosFiltrados = productosData.filter((producto) => {
        // DEPURAR: Ver estructura de subcategorías
        console.log(`Producto ${producto.nombre}:`, producto.subcategorias);
        
        return (
            producto.subcategorias &&
            Array.isArray(producto.subcategorias) &&
            producto.subcategorias.some(
                (sub) => {
                    console.log(`  Comparando: ${sub.id_subcategoria} === ${subcategoriaId}`);
                    return sub.id_subcategoria == subcategoriaId;
                }
            )
        );
    });
    console.log(`Productos filtrados: ${productosFiltrados.length}`);
    return productosFiltrados;
}


function mostrarProductos(productos) {
    if (!elementos.productosContainer) return;

    elementos.productosContainer.innerHTML = "";
    elementos.noProductos.classList.add("d-none");

    if (productos.length === 0) {
        mostrarMensajeSinProductos();
        return;
    }

    productos.forEach((producto, index) => {
        console.log(`Renderizando producto ${index + 1}: ${producto.nombre}`);
        const card = crearTarjetaProducto(producto);
        elementos.productosContainer.appendChild(card);
    });

    console.log(`${productos.length} productos mostrados`);
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

// FUNCIONES GLOBALES PARA ONCLICK
window.cambiarCantidad = function (productoId, cambio) {
    const input = document.getElementById(`cantidad-${productoId}`);
    if (!input) return;

    let nuevaCantidad = parseInt(input.value) + cambio;
    
    // Límites básicos del input
    nuevaCantidad = Math.max(1, nuevaCantidad);
    
    // VERIFICAR LÍMITE DINÁMICO BASADO EN CARRITO
    const cantidadEnCarrito = obtenerCantidadEnCarrito(productoId);
    const maxPermitido = Math.min(10, 10 - cantidadEnCarrito + parseInt(input.value));
    
    nuevaCantidad = Math.min(nuevaCantidad, maxPermitido);
    
    // FEEDBACK SI LLEGÓ AL LÍMITE
    if (cambio > 0 && nuevaCantidad === maxPermitido && maxPermitido < 10) {
        const disponible = 10 - cantidadEnCarrito;
        if (disponible > 0) {
            mostrarToast(`Máximo ${disponible} unidades disponibles de este producto`, 'info');
        }
    }

    input.value = nuevaCantidad;

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
        mostrarToast('Producto no encontrado', 'error');
        return;
    }

    const cantidadInput = document.getElementById(`cantidad-${productoId}`);
    const cantidadAAgregar = parseInt(cantidadInput.value) || 1;

    // VERIFICAR LÍMITES ANTES DE AGREGAR
    const verificacion = verificarLimiteProducto(productoId, cantidadAAgregar);
    
    if (!verificacion.puedeAgregar) {
        // NO SE PUEDE AGREGAR - Mostrar toast explicativo
        mostrarToast(verificacion.mensaje, 'warning');
        
        // Feedback visual en la card (opcional - color warning)
        const card = document.querySelector(`[data-producto-id="${productoId}"]`);
        if (card) {
            card.classList.add("border-warning");
            setTimeout(() => {
                card.classList.remove("border-warning");
            }, 2000);
        }
        
        console.log(`Límite alcanzado: ${producto.nombre} - ${verificacion.mensaje}`);
        return; // SALIR SIN AGREGAR
    }

    // TODO OK - Proceder a agregar
    const itemExistente = carritoItems.find(item => item.id_producto == productoId);

    if (itemExistente) {
        // Actualizar cantidad del item existente
        itemExistente.cantidad += cantidadAAgregar;
    } else {
        // Agregar nuevo item al carrito
        carritoItems.push({
            id_producto: producto.id_producto,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            descripcion: producto.descripcion,
            cantidad: cantidadAAgregar,
        });
    }

    // Feedback positivo
    const cantidadFinal = obtenerCantidadEnCarrito(productoId);
    mostrarFeedbackAgregarCarrito(productoId, producto.nombre, cantidadFinal);

    // Actualizar contador
    actualizarContadorCarrito();

    // Reset cantidad a 1
    cantidadInput.value = 1;

    // Guardar en localStorage
    localStorage.setItem("carrito", JSON.stringify(carritoItems));

    console.log(`${producto.nombre} agregado. Total en carrito: ${cantidadFinal}/10`);
};

function mostrarFeedbackAgregarCarrito(productoId, nombre, cantidadTotal) {
    // Feedback visual en la card
    const card = document.querySelector(`[data-producto-id="${productoId}"]`);
    if (card) {
        card.classList.add("border-success");
        setTimeout(() => {
            card.classList.remove("border-success");
        }, 1000);
    }

    // TOAST MEJORADO - Incluye información de límite
    const restante = 10 - cantidadTotal;
    let mensaje = `${nombre} agregado al carrito (${cantidadTotal}/10)`;
    
    if (restante === 0) {
        mensaje += ' - ¡Límite alcanzado!';
    } else if (restante <= 2) {
        mensaje += ` - Quedan ${restante} disponibles`;
    }
    
    mostrarToast(mensaje, "success");

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

// ESTADOS DE UI
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

// FUNCIONES AUXILIARES PARA LÍMITES
function obtenerCantidadEnCarrito(productoId) {
    const itemExistente = carritoItems.find(item => item.id_producto == productoId);
    return itemExistente ? itemExistente.cantidad : 0;
}


function verificarLimiteProducto(productoId, cantidadAAgregar) {
    const cantidadActual = obtenerCantidadEnCarrito(productoId);
    const cantidadDisponible = 10 - cantidadActual;
    
    // Si ya tiene 10, no puede agregar nada
    if (cantidadActual >= 10) {
        return {
            puedeAgregar: false,
            cantidadDisponible: 0,
            mensaje: 'Ya llegaste al límite de compra de este producto (10 unidades)'
        };
    }
    
    // Si la cantidad a agregar excede el disponible
    if (cantidadAAgregar > cantidadDisponible) {
        return {
            puedeAgregar: false,
            cantidadDisponible: cantidadDisponible,
            mensaje: `Solo puedes agregar ${cantidadDisponible} más de este producto (límite: 10 unidades)`
        };
    }
    
    // Todo OK
    return {
        puedeAgregar: true,
        cantidadDisponible: cantidadDisponible,
        mensaje: ''
    };
}

// SISTEMA DE TOASTS
function mostrarToast(mensaje, tipo = "info") {
    // Crear contenedor si no existe
    let toastContainer = document.querySelector(".toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.className =
            "toast-container position-fixed bottom-0 end-0 p-3";
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

// UTILIDADES
function limpiarCarrito() {
    carritoItems = [];
    actualizarContadorCarrito();
    localStorage.removeItem("carrito");
}

// Exponer funciones globales necesarias
window.limpiarCarrito = limpiarCarrito;

console.log("productos.js cargado correctamente");