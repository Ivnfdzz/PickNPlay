// ESTADO GLOBAL DEL DASHBOARD
const DashboardCore = {
    // Estado actual
    currentEntity: null,
    currentOperation: null,
    currentUser: null,

    // Elementos del DOM
    elements: {
        // Navbar
        btnUsuario: document.getElementById("btn-usuario"),
        usuarioNombre: document.getElementById("usuario-nombre"),
        btnModoOscuro: document.getElementById("btn-modo-oscuro"),

        // Sidebar
        selectorEntidad: document.getElementById("selector-entidad"),
        operacionesCrud: document.getElementById("operaciones-crud"),
        crudOptions: document.querySelectorAll(".crud-option"),
        btnAuditoria: document.getElementById("btn-auditoria"),
        btnEstadisticas: document.getElementById("btn-estadisticas"),

        // Área central
        bienvenidaDashboard: document.getElementById("bienvenida-dashboard"),
        contenidoDinamico: document.getElementById("contenido-dinamico"),
    },

    // Inicialización principal
    init() {
        console.log("🎛️ Inicializando Dashboard Core...");

        try {
            if (!Auth.getCurrentUser()) {
                return;
            }

            // Verificar autenticación primero
            if (!Auth.requireAuth()) {
                return;
            }

            // Obtener usuario actual
            this.currentUser = Auth.getCurrentUser();

            // Configurar eventos
            this.configurarEventos();

            // Configurar usuario en UI (si querés mostrar el nombre)
            if (this.elements.usuarioNombre && this.currentUser) {
                this.elements.usuarioNombre.textContent =
                    this.currentUser.username;
            }

            // Estado inicial
            this.mostrarBienvenida();

            console.log("✅ Dashboard Core inicializado correctamente");
        } catch (error) {
            console.error("❌ Error inicializando Dashboard Core:", error);
            mostrarToast("Error inicializando el dashboard", "error");
        }
    },

    // CONFIGURACIÓN DE EVENTOS
    configurarEventos() {
        // Navbar
        if (this.elements.btnUsuario) {
            this.elements.btnUsuario.addEventListener("click", () => {
                this.mostrarInfoUsuario();
            });
        }

        if (this.elements.btnModoOscuro) {
            this.elements.btnModoOscuro.addEventListener("click", () => {
                this.toggleModoOscuro();
            });
        }

        // Sidebar - Selector de entidad
        if (this.elements.selectorEntidad) {
            this.elements.selectorEntidad.addEventListener("change", (e) => {
                this.manejarSeleccionEntidad(e.target.value);
            });
        }

        // Sidebar - Operaciones CRUD
        this.elements.crudOptions.forEach((option) => {
            option.addEventListener("click", (e) => {
                e.preventDefault();
                const operacion = e.currentTarget.dataset.operacion;
                this.manejarSeleccionOperacion(operacion);
            });
        });

        // Sidebar - Botones de informes
        if (this.elements.btnAuditoria) {
            this.elements.btnAuditoria.addEventListener("click", () => {
                this.mostrarAuditoria();
            });
        }

        if (this.elements.btnEstadisticas) {
            this.elements.btnEstadisticas.addEventListener("click", () => {
                this.mostrarEstadisticas();
            });
        }

        console.log("✅ Eventos configurados");
    },

    // MANEJO DE ENTIDADES Y OPERACIONES
    manejarSeleccionEntidad(entidad) {
        if (!entidad) {
            this.mostrarBienvenida();
            this.ocultarOperacionesCrud();
            return;
        }

        console.log(`📋 Entidad seleccionada: ${entidad}`);
        this.currentEntity = entidad;
        this.currentOperation = null;

        // Mostrar opciones CRUD
        this.mostrarOperacionesCrud();

        // Limpiar selección de operación anterior
        this.limpiarSeleccionOperacion();

        // Emitir evento para que otros módulos se enteren
        this.emitirEventoEntidad(entidad);
    },

    manejarSeleccionOperacion(operacion) {
        if (!this.currentEntity) {
            mostrarToast("Primero selecciona una entidad", "warning");
            return;
        }

        // VALIDACIÓN 1: Acceso a la entidad
        if (
            !Permisos.validarAccesoEntidad(this.currentUser, this.currentEntity)
        ) {
            mostrarToast(
                `❌ Acceso denegado. Permisos insuficientes para gestionar ${this.currentEntity}`,
                "error"
            );
            return;
        }

        // VALIDACIÓN 2: Operaciones especiales
        const validacionEspecial = Permisos.validarOperacionEspecial(
            this.currentUser,
            this.currentEntity,
            operacion
        );
        if (!validacionEspecial.permitido) {
            mostrarToast(`❌ ${validacionEspecial.mensaje}`, "warning");
            return;
        }

        // VALIDACIÓN 3: Permisos generales de rol
        if (
            !Permisos.validarPermisoOperacion(
                this.currentUser,
                this.currentEntity,
                operacion
            )
        ) {
            mostrarToast(
                `❌ Acceso denegado. Permisos insuficientes para ${operacion} en ${this.currentEntity}`,
                "error"
            );
            return;
        }

        console.log(
            `⚙️ Operación autorizada: ${operacion} para ${this.currentEntity}`
        );
        this.currentOperation = operacion;

        // Actualizar UI de selección
        this.actualizarSeleccionOperacion(operacion);

        // Ocultar bienvenida y mostrar contenido dinámico
        this.mostrarContenidoDinamico();

        // Emitir evento para que CRUD maneje la operación
        this.emitirEventoCrud(this.currentEntity, operacion);
    },

    // MANEJO DE INFORMES
    mostrarAuditoria() {
        // Validar permisos para auditoría
        if (!["root", "analista"].includes(this.currentUser.rol)) {
            mostrarToast(
                "❌ Acceso denegado. Permisos insuficientes para ver la auditoría",
                "error"
            );
            return;
        }

        console.log("📊 Mostrando auditoría");
        this.limpiarSelecciones();
        this.mostrarContenidoDinamico();

        // Emitir evento para auditoría
        document.dispatchEvent(new CustomEvent("mostrarAuditoria"));
    },

    // ✅ MODIFICAR mostrarEstadisticas:

    mostrarEstadisticas() {
        if (!["root", "analista"].includes(this.currentUser.rol)) {
            mostrarToast(
                "❌ Acceso denegado. Permisos insuficientes para ver las estadísticas",
                "error"
            );
            return;
        }
        console.log("📈 Mostrando estadísticas");
        this.limpiarSelecciones();
        this.mostrarContenidoDinamico();

        // Emitir evento para estadísticas
        document.dispatchEvent(new CustomEvent("mostrarEstadisticas"));
    },

    // GESTIÓN DE UI
    mostrarBienvenida() {
        this.elements.bienvenidaDashboard.classList.remove("d-none");
        this.elements.contenidoDinamico.classList.add("d-none");
        this.elements.contenidoDinamico.innerHTML = "";
    },

    mostrarContenidoDinamico() {
        this.elements.bienvenidaDashboard.classList.add("d-none");
        this.elements.contenidoDinamico.classList.remove("d-none");
    },

    mostrarOperacionesCrud() {
        if (this.elements.operacionesCrud) {
            this.elements.operacionesCrud.classList.remove("d-none");
        }
    },

    ocultarOperacionesCrud() {
        if (this.elements.operacionesCrud) {
            this.elements.operacionesCrud.classList.add("d-none");
        }
    },

    actualizarSeleccionOperacion(operacion) {
        // Limpiar selecciones anteriores
        this.elements.crudOptions.forEach((option) => {
            option.classList.remove("active");
        });

        // Marcar la operación actual
        const opcionActual = document.querySelector(
            `[data-operacion="${operacion}"]`
        );
        if (opcionActual) {
            opcionActual.classList.add("active");
        }
    },

    limpiarSelecciones() {
        // Limpiar selector de entidad
        if (this.elements.selectorEntidad) {
            this.elements.selectorEntidad.value = "";
        }

        // Ocultar operaciones CRUD
        this.ocultarOperacionesCrud();

        // Limpiar selección de operación
        this.limpiarSeleccionOperacion();

        // Resetear estado
        this.currentEntity = null;
        this.currentOperation = null;
    },

    limpiarSeleccionOperacion() {
        this.elements.crudOptions.forEach((option) => {
            option.classList.remove("active");
        });
    },

    // COMUNICACIÓN ENTRE MÓDULOS
    emitirEventoEntidad(entidad) {
        document.dispatchEvent(
            new CustomEvent("entidadSeleccionada", {
                detail: { entidad },
            })
        );
    },

    emitirEventoCrud(entidad, operacion) {
        document.dispatchEvent(
            new CustomEvent("operacionCrudSeleccionada", {
                detail: { entidad, operacion },
            })
        );
    },

    // FUNCIONALIDADES ADICIONALES
    mostrarInfoUsuario() {
        const infoHtml = `
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">
                <i class="bi bi-person-circle me-2"></i>
                Información del Usuario
            </h6>
            <div class="btn-group btn-group-sm">
                <button onclick="DashboardCore.mostrarBienvenida(); DashboardCore.limpiarSelecciones();" class="btn btn-outline-secondary">
                    <i class="bi bi-arrow-left me-1"></i>Volver
                </button>
                <button onclick="Auth.handleLogout()" class="btn btn-outline-danger">
                    <i class="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
                </button>
            </div>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-8">
                    <p class="mb-2"><strong>Usuario:</strong> ${
                        this.currentUser.username
                    }</p>
                    <p class="mb-2"><strong>Email:</strong> ${
                        this.currentUser.email
                    }</p>
                    <p class="mb-2"><strong>Rol:</strong> ${
                        this.currentUser.rol
                    }</p>
                    <p class="mb-0"><strong>Permisos:</strong></p>
                    <small class="text-muted">${Permisos.getDescripcionPermisos(
                        this.currentUser.rol
                    )}</small>
                </div>
            </div>
        </div>
    </div>
    `;

        this.mostrarContenidoDinamico();
        this.elements.contenidoDinamico.innerHTML = infoHtml;
        this.limpiarSelecciones();
    },

    toggleModoOscuro() {
        const html = document.documentElement;
        const esModoOscuro = html.getAttribute("data-bs-theme") === "dark";

        if (esModoOscuro) {
            html.setAttribute("data-bs-theme", "light");
            this.elements.btnModoOscuro.innerHTML =
                '<i class="bi bi-moon"></i>';
            localStorage.setItem("tema", "light");
        } else {
            html.setAttribute("data-bs-theme", "dark");
            this.elements.btnModoOscuro.innerHTML = '<i class="bi bi-sun"></i>';
            localStorage.setItem("tema", "dark");
        }

        console.log(`🌙 Modo ${esModoOscuro ? "claro" : "oscuro"} activado`);
    },

    cargarTemaGuardado() {
        const temaGuardado = localStorage.getItem("tema");
        if (temaGuardado === "dark") {
            document.documentElement.setAttribute("data-bs-theme", "dark");
            this.elements.btnModoOscuro.innerHTML = '<i class="bi bi-sun"></i>';
        }
    },

    // MÉTODOS PÚBLICOS PARA OTROS MÓDULOS
    getEstadoActual() {
        return {
            entidad: this.currentEntity,
            operacion: this.currentOperation,
            usuario: this.currentUser,
        };
    },

    actualizarContenido(html) {
        this.mostrarContenidoDinamico();
        this.elements.contenidoDinamico.innerHTML = html;
    },

    mostrarLoading(mensaje = "Cargando...") {
        const loadingHtml = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="text-muted">${mensaje}</p>
            </div>
        `;
        this.actualizarContenido(loadingHtml);
    },
};

document.addEventListener("operacionCrudSeleccionada", (e) => {
    const { entidad, operacion } = e.detail;
    if (entidad === "productos" && operacion === "listar") {
        listarProductos();
    }
});

// INICIALIZACIÓN CUANDO CARGA EL DOM
document.addEventListener("DOMContentLoaded", () => {
    DashboardCore.init();
    DashboardCore.cargarTemaGuardado();
});

// Hacer disponible globalmente para otros módulos
window.DashboardCore = DashboardCore;

console.log("📝 dashboard-core.js cargado correctamente");
