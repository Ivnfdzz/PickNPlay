/**
 * PICK&PLAY - CONTROLADOR DE SELECCIÓN DE CATEGORÍAS
 * 
 * @description Módulo responsable de la navegación y selección de categorías
 *              de productos. Gestiona la interacción del usuario con las tarjetas
 *              de categorías y controla la transición hacia el catálogo de productos.
 * 
 * @features    - Validación de sesión del cliente
 *              - Configuración interactiva de tarjetas de categoría
 *              - Persistencia de selección en localStorage
 *              - Navegación fluida hacia productos
 *              - Feedback visual de selección
 * 
 * @business    La selección de categorías es el primer paso del proceso de compra,
 *              dirigiendo al cliente hacia los productos de su interés. Su diseño
 *              intuitivo facilita la navegación y mejora la experiencia de compra.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

/**
 * Inicializa la página de selección de categorías
 * @description Verifica la sesión del cliente y configura la interactividad
 * @listens DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", async () => {
    // Verificar que el usuario tenga nombre
    const nombreCliente = localStorage.getItem("nombreCliente");
    if (!nombreCliente) {
        alert("Debes ingresar tu nombre primero");
        location.assign("/frontend/html/views/index.html");
        return;
    }

    // Configurar eventos de las cards
    configurarEventosCards();
});

/**
 * Configura los event listeners para las tarjetas de categoría
 * @description Establece la funcionalidad de selección y navegación de categorías
 * @business Punto de entrada principal para la navegación del catálogo
 */
function configurarEventosCards() {
    const cards = document.querySelectorAll(".categoria-card");

    cards.forEach((card) => {
        card.addEventListener("click", function () {
            const categoriaId = this.dataset.categoriaId;
            const categoriaNombre = this.dataset.categoriaNombre;

            // Guardar selección
            localStorage.setItem("categoriaSeleccionada", categoriaId);
            localStorage.setItem("nombreCategoria", categoriaNombre);

            // Navegar después del feedback
            location.assign("/frontend/html/views/productos.html");
        });
    });
}
