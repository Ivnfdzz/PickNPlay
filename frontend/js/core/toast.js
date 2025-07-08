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

window.mostrarToast = mostrarToast;
