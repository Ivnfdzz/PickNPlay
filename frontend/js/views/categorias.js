// filepath: c:\Users\User\OneDrive\Desktop\PickNPlay.TP\frontend\js\categorias.js
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
