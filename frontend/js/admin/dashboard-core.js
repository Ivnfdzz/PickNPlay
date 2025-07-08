/**
 * PICK&PLAY - NÚCLEO DEL DASHBOARD ADMINISTRATIVO
 * 
 * @description Módulo central que coordina todas las funcionalidades del dashboard administrativo.
 *              Actúa como controlador principal que gestiona la navegación, validaciones de permisos,
 *              y comunicación entre los diferentes módulos especializados del sistema.
 * 
 * @features    - Inicialización y configuración completa del dashboard
 *              - Gestión de eventos de navegación y operaciones CRUD
 *              - Validación de permisos y control de acceso por roles
 *              - Coordinación entre módulos especializados
 *              - Manejo de estados de UI (loading, contenido dinámico)
 *              - Comunicación inter-módulos mediante eventos personalizados
 *              - Gestión de sesiones y datos de usuario actual
 * 
 * @architecture - Core: Lógica central y navegación principal
 *               - Especializados: productos, usuarios, pedidos, auditoría, etc.
 *               - Permisos: Validaciones de acceso y autorización
 *               - API: Comunicación segura con backend
 * 
 * @business    El núcleo centraliza toda la lógica administrativa, asegurando
 *              un flujo coherente y seguro entre las diferentes funcionalidades
 *              del sistema de gestión empresarial.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

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
        console.log("Inicializando Dashboard Core...");

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

            console.log("Dashboard Core inicializado correctamente");
        } catch (error) {
            console.error("Error inicializando Dashboard Core:", error);
            mostrarToast("Error inicializando el dashboard", "error");
        }
    },

    /**
     * Configura todos los event listeners del dashboard
     * @description Vincula los eventos del navbar, sidebar, selectores y botones
     * @memberof DashboardCore
     */
    configurarEventos() {
        // Navbar
        if (this.elements.btnUsuario) {
            this.elements.btnUsuario.addEventListener("click", () => {
                this.mostrarInfoUsuario();
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

        console.log("Eventos configurados");
    },

    /**
     * Maneja la selección de una entidad desde el dropdown
     * @param {string} entidad - Nombre de la entidad seleccionada (productos, usuarios, etc.)
     * @description Actualiza el estado del dashboard, muestra opciones CRUD y emite eventos
     * @memberof DashboardCore
     */
    manejarSeleccionEntidad(entidad) {
        if (!entidad) {
            this.mostrarBienvenida();
            this.ocultarOperacionesCrud();
            return;
        }

        console.log(`Entidad seleccionada: ${entidad}`);
        this.currentEntity = entidad;
        this.currentOperation = null;

        // Mostrar opciones CRUD
        this.mostrarOperacionesCrud();

        // Limpiar selección de operación anterior
        this.limpiarSeleccionOperacion();

        // Emitir evento para que otros módulos se enteren
        this.emitirEventoEntidad(entidad);
    },

    /**
     * Procesa la selección de una operación CRUD con validación de permisos
     * @param {string} operacion - Tipo de operación (crear, listar, editar, eliminar)
     * @description Valida permisos de usuario y entidad antes de permitir la operación
     * @memberof DashboardCore
     */
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
                `Acceso denegado. Permisos insuficientes para gestionar ${this.currentEntity}`,
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
            mostrarToast(`${validacionEspecial.mensaje}`, "warning");
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
                `Acceso denegado. Permisos insuficientes para ${operacion} en ${this.currentEntity}`,
                "error"
            );
            return;
        }

        console.log(
            `Operación autorizada: ${operacion} para ${this.currentEntity}`
        );
        this.currentOperation = operacion;

        // Actualizar UI de selección
        this.actualizarSeleccionOperacion(operacion);

        // Ocultar bienvenida y mostrar contenido dinámico
        this.mostrarContenidoDinamico();

        // Emitir evento para que CRUD maneje la operación
        this.emitirEventoCrud(this.currentEntity, operacion);
    },

    /**
     * Muestra el módulo de auditoría con validación de permisos
     * @description Solo accesible para usuarios con rol 'root' o 'analista'
     * @memberof DashboardCore
     */
    mostrarAuditoria() {
        // Validar permisos para auditoría
        if (!["root", "analista"].includes(this.currentUser.rol)) {
            mostrarToast(
                "Acceso denegado. Permisos insuficientes para ver la auditoría",
                "error"
            );
            return;
        }

        console.log("Mostrando auditoría");
        this.limpiarSelecciones();
        this.mostrarContenidoDinamico();

        // Emitir evento para auditoría
        document.dispatchEvent(new CustomEvent("mostrarAuditoria"));
    },

    /**
     * Muestra el módulo de estadísticas con validación de permisos
     * @description Solo accesible para usuarios con rol 'root' o 'analista'
     * @memberof DashboardCore
     */
    mostrarEstadisticas() {
        if (!["root", "analista"].includes(this.currentUser.rol)) {
            mostrarToast(
                "Acceso denegado. Permisos insuficientes para ver las estadísticas",
                "error"
            );
            return;
        }
        console.log("Mostrando estadísticas");
        this.limpiarSelecciones();
        this.mostrarContenidoDinamico();

        // Emitir evento para estadísticas
        document.dispatchEvent(new CustomEvent("mostrarEstadisticas"));
    },

    /**
     * Muestra la pantalla de bienvenida del dashboard
     * @description Oculta el contenido dinámico y muestra el mensaje de bienvenida
     * @memberof DashboardCore
     */
    mostrarBienvenida() {
        this.elements.bienvenidaDashboard.classList.remove("d-none");
        this.elements.contenidoDinamico.classList.add("d-none");
        this.elements.contenidoDinamico.innerHTML = "";
    },

    /**
     * Muestra el área de contenido dinámico del dashboard
     * @description Oculta la bienvenida y muestra el área donde se cargan los módulos
     * @memberof DashboardCore
     */
    mostrarContenidoDinamico() {
        this.elements.bienvenidaDashboard.classList.add("d-none");
        this.elements.contenidoDinamico.classList.remove("d-none");
    },

    /**
     * Hace visibles las opciones de operaciones CRUD en el sidebar
     * @memberof DashboardCore
     */
    mostrarOperacionesCrud() {
        if (this.elements.operacionesCrud) {
            this.elements.operacionesCrud.classList.remove("d-none");
        }
    },

    /**
     * Oculta las opciones de operaciones CRUD en el sidebar
     * @memberof DashboardCore
     */
    ocultarOperacionesCrud() {
        if (this.elements.operacionesCrud) {
            this.elements.operacionesCrud.classList.add("d-none");
        }
    },

    /**
     * Actualiza la selección visual de la operación activa
     * @param {string} operacion - Operación seleccionada (crear, listar, etc.)
     * @description Marca visualmente la operación activa en el sidebar
     * @memberof DashboardCore
     */
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

    /**
     * Limpia todas las selecciones del dashboard y resetea el estado
     * @description Resetea selector de entidad, oculta CRUD y limpia variables de estado
     * @memberof DashboardCore
     */
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

    /**
     * Remueve la clase 'active' de todas las opciones CRUD
     * @memberof DashboardCore
     */
    limpiarSeleccionOperacion() {
        this.elements.crudOptions.forEach((option) => {
            option.classList.remove("active");
        });
    },

    /**
     * Emite evento de selección de entidad para comunicación entre módulos
     * @param {string} entidad - Entidad seleccionada
     * @memberof DashboardCore
     */
    emitirEventoEntidad(entidad) {
        document.dispatchEvent(
            new CustomEvent("entidadSeleccionada", {
                detail: { entidad },
            })
        );
    },

    /**
     * Emite evento de operación CRUD para comunicación entre módulos
     * @param {string} entidad - Entidad sobre la que se realiza la operación
     * @param {string} operacion - Tipo de operación CRUD
     * @memberof DashboardCore
     */
    emitirEventoCrud(entidad, operacion) {
        document.dispatchEvent(
            new CustomEvent("operacionCrudSeleccionada", {
                detail: { entidad, operacion },
            })
        );
    },

    /**
     * Muestra información detallada del usuario actual
     * @description Genera y muestra una tarjeta con datos del usuario y sus permisos
     * @memberof DashboardCore
     */
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

    /**
     * Obtiene el estado actual del dashboard
     * @returns {Object} Objeto con entidad, operación y usuario actual
     * @description Método público para que otros módulos accedan al estado
     * @memberof DashboardCore
     */
    getEstadoActual() {
        return {
            entidad: this.currentEntity,
            operacion: this.currentOperation,
            usuario: this.currentUser,
        };
    },

    /**
     * Actualiza el contenido del área dinámica del dashboard
     * @param {string} html - Contenido HTML a mostrar
     * @description Método público para que otros módulos actualicen la vista
     * @memberof DashboardCore
     */
    actualizarContenido(html) {
        this.mostrarContenidoDinamico();
        this.elements.contenidoDinamico.innerHTML = html;
    },

    /**
     * Muestra un indicador de carga en el área de contenido dinámico
     * @param {string} [mensaje="Cargando..."] - Mensaje personalizado para mostrar
     * @description Útil durante operaciones asíncronas para mejorar UX
     * @memberof DashboardCore
     */
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
    if (entidad === "productos" && operacion === "crear") {
        mostrarFormularioCrearProducto();
    }
    if (entidad === "subcategorias" && operacion === "listar") {
        listarSubcategorias();
    }
    if (entidad === "subcategorias" && operacion === "crear") {
        mostrarFormularioCrearSubcategoria();
    }
    if (entidad === "usuarios" && operacion === "listar") {
        listarUsuarios();
    }
    if (entidad === "usuarios" && operacion === "crear") {
        mostrarFormularioCrearUsuario();
    }
    if (entidad === "metodosPago" && operacion === "listar") {
        listarMetodosPago();
    }
    if (entidad === "metodosPago" && operacion === "crear") {
        mostrarFormularioCrearMetodoPago();
    }
    if (entidad === "pedidos" && operacion === "listar") {
        listarPedidos();
    }
});

DashboardCore.elements.btnAuditoria.addEventListener("click", () => {
    // Oculta bienvenida y muestra el contenedor dinámico
    if (DashboardCore.elements.bienvenidaDashboard) {
        DashboardCore.elements.bienvenidaDashboard.classList.add("d-none");
    }
    if (DashboardCore.elements.contenidoDinamico) {
        DashboardCore.elements.contenidoDinamico.classList.remove("d-none");
    }
    listarLogsAuditoria();
});

DashboardCore.elements.btnEstadisticas.addEventListener("click", () => {
    // Oculta bienvenida y muestra el contenedor dinámico
    if (DashboardCore.elements.bienvenidaDashboard) {
        DashboardCore.elements.bienvenidaDashboard.classList.add("d-none");
    }
    if (DashboardCore.elements.contenidoDinamico) {
        DashboardCore.elements.contenidoDinamico.classList.remove("d-none");
    }
    mostrarEstadisticas();
});

document.addEventListener("DOMContentLoaded", () => {
    DashboardCore.init();
});

// Hacer disponible globalmente para otros módulos
window.DashboardCore = DashboardCore;
