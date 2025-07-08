/**
 * PICK&PLAY - CONTROLADOR DE CATÁLOGO DE PRODUCTOS
 * 
 * @description Módulo responsable de la visualización y gestión del catálogo
 *              de productos. Maneja la navegación por subcategorías, filtrado
 *              de productos y funcionalidades de agregar al carrito.
 * 
 * @features    - Carga dinámica de productos por categoría desde API
 *              - Sistema de filtrado por subcategorías
 *              - Gestión completa del carrito de compras
 *              - Controles de cantidad con validaciones
 *              - Feedback visual y gestión de estados
 *              - Persistencia del carrito en localStorage
 *              - Navegación fluida entre secciones
 *              - Contador dinámico de productos en carrito
 * 
 * @business    El catálogo es el corazón de la experiencia de compra,
 *              donde los clientes exploran y seleccionan productos.
 *              Su funcionamiento óptimo es crucial para las ventas
 *              y la satisfacción del cliente.
 * 
 * @version     1.0.0
 * @since       2024
 * @authors     Iván Fernández y Luciano Fattoni
 */

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

/**
 * Inicializa la página del catálogo de productos
 * @description Configuración principal, verificación de datos y carga de catálogo
 * @listens DOMContentLoaded
 */
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

/**
 * Verifica que existan todos los datos necesarios para mostrar productos
 * @returns {boolean} true si los datos son válidos, false si hay error
 * @description Valida cliente, categoría seleccionada y carga carrito existente
 */
function verificarDatosIniciales() {
    const nombreCliente = localStorage.getItem("nombreCliente");
    const categoriaId = localStorage.getItem("categoriaSeleccionada");
    const categoriaNombre = localStorage.getItem("nombreCategoria");

    if (!nombreCliente) {
        console.error("No hay nombre de cliente");
        mostrarToast("Debes ingresar tu nombre primero", "error");
        setTimeout(() => {
            location.assign("/backend/src/html/views/index.html");
        }, 2000);
        return false;
    }

    if (!categoriaId || !categoriaNombre) {
        console.error("No hay categoría seleccionada");
        mostrarToast("Debes seleccionar una categoría primero", "error");
        setTimeout(() => {
            location.assign("/backend/src/html/views/categorias.html");
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

/**
 * Recupera los items del carrito desde localStorage
 * @description Carga el estado del carrito para mantener continuidad de compra
 */
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

/**
 * Configura los elementos iniciales de la interfaz de usuario
 * @description Personaliza la UI con información del cliente y categoría
 */
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

/**
 * Configura todos los event listeners de la interfaz
 * @description Establece navegación y funcionalidades interactivas
 */
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
            location.assign("/frontend/html/views/carrito.html");
        });
    }
}

/**
 * Carga todos los datos necesarios desde la API
 * @async
 * @description Obtiene subcategorías y productos de la categoría seleccionada
 */
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

/**
 * Carga las subcategorías de la categoría actual desde la API
 * @async
 * @description Obtiene subcategorías para el filtrado de productos
 */
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

/**
 * Carga todos los productos de la categoría actual desde la API
 * @async
 * @description Obtiene el catálogo completo de productos disponibles
 */
async function cargarProductos() {
    try {
        const response = await apiInstance.getProductosPorCategoria(categoriaActual.id);
        
        productosData = response.productos || [];

        console.log(` ${productosData.length} productos cargados`);
    } catch (error) {
        console.error(" Error cargando productos:", error);
        throw error;
    }
}

/**
 * Renderiza la lista de subcategorías en el sidebar
 * @description Crea botones de filtrado para navegación por subcategorías
 */
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

/**
 * Crea un botón de subcategoría para el sidebar
 * @param {Object} subcategoria - Datos de la subcategoría
 * @returns {HTMLElement} Elemento botón de subcategoría
 * @description Genera botón con icono y nombre de subcategoría
 */
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

/**
 * Configura event listeners para los botones de subcategorías
 * @description Establece la funcionalidad de filtrado por subcategoría
 */
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

/**
 * Maneja la selección de una subcategoría específica
 * @param {string} subcategoriaId - ID de la subcategoría seleccionada
 * @param {HTMLElement} botonClickeado - Botón que fue clickeado
 * @description Filtra productos y actualiza UI según subcategoría seleccionada
 */
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

/**
 * Filtra los productos según la subcategoría seleccionada
 * @param {string} subcategoriaId - ID de la subcategoría para filtrar
 * @returns {Array} Array de productos filtrados
 * @description Aplica filtro de subcategoría al catálogo de productos
 */
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


/**
 * Renderiza la lista de productos en el grid principal
 * @param {Array} productos - Array de productos a mostrar
 * @description Crea tarjetas de productos con controles de cantidad y compra
 * @business Presentación atractiva del catálogo para impulsar ventas
 */
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

/**
 * Crea la tarjeta individual de un producto
 * @param {Object} producto - Datos del producto
 * @returns {HTMLElement} Elemento DOM de la tarjeta del producto
 * @description Genera tarjeta completa con imagen, info, precio y controles
 */
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
            <img src="/backend/src/img/productos/${producto.imagen}" 
                    class="card-img-top" 
                    alt="${producto.nombre}"
                    onerror="this.src='/backend/src/img/productos/default.jpg'">
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

/**
 * Modifica la cantidad seleccionada de un producto
 * @param {number} productoId - ID del producto
 * @param {number} cambio - Cambio en cantidad (+1 o -1)
 * @description Función global para controles de cantidad con límites dinámicos
 * @global
 */
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

/**
 * Agrega un producto al carrito con la cantidad seleccionada
 * @param {number} productoId - ID del producto a agregar
 * @description Función global para agregar productos con validaciones de límites
 * @business Función crítica para la conversión de navegación en venta
 * @global
 */
window.agregarAlCarrito = function (productoId) {
    const producto = productosData.find((p) => p.id_producto == productoId);
    if (!producto) {
        console.error("Producto no encontrado:", productoId);
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

/**
 * Muestra feedback visual al agregar producto al carrito
 * @param {number} productoId - ID del producto agregado
 * @param {string} nombre - Nombre del producto
 * @param {number} cantidadTotal - Cantidad total en carrito
 * @description Proporciona confirmación visual de la acción realizada
 */
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

/**
 * Actualiza el contador visual de productos en el carrito
 * @description Mantiene sincronizado el indicador de carrito en la UI
 */
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

/**
 * Controla la visualización del indicador de carga
 * @param {boolean} mostrar - true para mostrar, false para ocultar
 * @description Gestiona el estado de loading durante cargas de datos
 */
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

/**
 * Muestra mensaje cuando no hay productos disponibles
 * @description Informa al usuario sobre ausencia de productos en la categoría
 */
function mostrarMensajeSinProductos() {
    if (elementos.noProductos) {
        elementos.noProductos.classList.remove("d-none");
        elementos.productosContainer.classList.add("d-none");
    }
}

/**
 * Muestra mensaje de error al cargar datos
 * @description Informa al usuario sobre problemas de conectividad o carga
 */
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

/**
 * Obtiene la cantidad actual de un producto en el carrito
 * @param {number} productoId - ID del producto a consultar
 * @returns {number} Cantidad del producto en el carrito
 * @description Utilidad para verificar límites y validaciones
 */
function obtenerCantidadEnCarrito(productoId) {
    const itemExistente = carritoItems.find(item => item.id_producto == productoId);
    return itemExistente ? itemExistente.cantidad : 0;
}


/**
 * Verifica si se puede agregar una cantidad específica al carrito
 * @param {number} productoId - ID del producto
 * @param {number} cantidadAAgregar - Cantidad que se desea agregar
 * @returns {boolean} true si se puede agregar, false si excede límites
 * @description Valida límites máximos por producto en el carrito
 */
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

/**
 * Limpia completamente el carrito de compras
 * @description Elimina todos los productos del carrito y actualiza localStorage
 * @global
 */
function limpiarCarrito() {
    carritoItems = [];
    actualizarContadorCarrito();
    localStorage.removeItem("carrito");
}

// Exponer funciones globales necesarias
window.limpiarCarrito = limpiarCarrito;
