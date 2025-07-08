/**
 * PICK&PLAY - SISTEMA DE PERMISOS ADMINISTRATIVOS
 * 
 * @description Módulo responsable de la gestión completa de permisos y validaciones
 *              de acceso para el panel administrativo. Define qué operaciones puede
 *              realizar cada rol dentro del sistema y valida el acceso a entidades
 *              específicas según el contexto de negocio.
 * 
 * @features    - Matriz de permisos por rol del sistema
 *              - Validaciones básicas por operación CRUD
 *              - Control de acceso a entidades específicas
 *              - Validaciones especiales por contexto de negocio
 *              - Descripción detallada de permisos por rol
 *              - Sistema de mensajes informativos para denegaciones
 * 
 * @roles       - root: Acceso completo a todas las funcionalidades del sistema
 *              - analista: Solo visualización, reportes y auditorías
 *              - repositor: Gestión de productos sin capacidad de eliminación
 * 
 * @security    El sistema de permisos es crítico para la seguridad, asegurando
 *              que cada usuario solo acceda a las funcionalidades autorizadas
 *              según su rol y responsabilidades en la organización.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

/**
 * Matriz de permisos del sistema administrativo
 * @constant {Object} PERMISOS_SISTEMA - Define operaciones permitidas por rol
 * @description Estructura que define qué operaciones CRUD puede realizar cada rol,
 *              siendo la base para todas las validaciones de acceso del sistema.
 */
const PERMISOS_SISTEMA = {
    root: ["all"], // Acceso completo sin restricciones
    analista: ["listar", "buscar"], // Solo lectura y consultas
    repositor: ["crear", "listar", "buscar"], // Sin capacidad de eliminación
};

/* ================================================
   VALIDACIONES DE PERMISOS
   ================================================ */

/**
 * Valida si un usuario tiene permiso para realizar una operación específica
 * 
 * @param {Object} usuario - Objeto usuario con propiedad 'rol'
 * @param {string} entidad - Nombre de la entidad (productos, usuarios, etc.)
 * @param {string} operacion - Operación a validar (crear, listar, editar, eliminar)
 * @returns {boolean} true si tiene permiso, false en caso contrario
 */
function validarPermisoOperacion(usuario, entidad, operacion) {
    const permisosUsuario = PERMISOS_SISTEMA[usuario.rol];
    if (!permisosUsuario) return false;
    if (permisosUsuario.includes("all")) return true;
    return permisosUsuario.includes(operacion);
}

/**
 * Valida si un usuario puede acceder a una entidad específica
 * 
 * Algunas entidades tienen restricciones especiales:
 * - usuarios: Solo accesible por root
 * - auditoria: Solo accesible por root y analista
 * 
 * @param {Object} usuario - Objeto usuario con propiedad 'rol'
 * @param {string} entidad - Nombre de la entidad a validar
 * @returns {boolean} true si puede acceder, false en caso contrario
 */
function validarAccesoEntidad(usuario, entidad) {
    if (entidad === "usuarios" && usuario.rol !== "root") return false;
    if (entidad === "auditoria" && !["root", "analista"].includes(usuario.rol))
        return false;
    return true;
}

/**
 * Valida operaciones especiales que requieren lógica de negocio adicional
 * 
 * Estas validaciones van más allá de los permisos básicos y evalúan
 * contextos específicos del negocio para determinar si una operación
 * debe ser permitida.
 * 
 * @param {Object} usuario - Objeto usuario con propiedad 'rol'
 * @param {string} entidad - Nombre de la entidad
 * @param {string} operacion - Operación a validar
 * @returns {Object} { permitido: boolean, mensaje?: string }
 */
function validarOperacionEspecial(usuario, entidad, operacion) {
    // Los pedidos solo se crean desde el frontend de cliente
    if (entidad === "pedidos" && operacion === "crear") {
        return {
            permitido: false,
            mensaje: "Solo clientes pueden crear pedidos desde la tienda",
        };
    }
    
    // Solo root puede eliminar usuarios (seguridad del sistema)
    if (
        entidad === "usuarios" &&
        operacion === "eliminar" &&
        usuario.rol !== "root"
    ) {
        return {
            permitido: false,
            mensaje: "Solo el administrador root puede eliminar usuarios",
        };
    }
    
    // Acceso a pedidos restringido por confidencialidad
    if (
        entidad === "pedidos" &&
        ["listar", "buscar"].includes(operacion) &&
        !["root", "analista"].includes(usuario.rol)
    ) {
        return {
            permitido: false,
            mensaje:
                "Solo el administrador root y analista puede listar o buscar pedidos",
        };
    }
    
    // Gestión de estructura del catálogo (categorías/subcategorías)
    if (
        ["subcategorias", "categorias"].includes(entidad) &&
        operacion === "crear" &&
        usuario.rol !== "root"
    ) {
        return {
            permitido: false,
            mensaje:
                "Solo el administrador root puede crear subcategorías o categorías",
        };
    }
    
    // Gestión de métodos de pago (configuración crítica)
    if (
        entidad === "metodosPago" &&
        ["crear", "eliminar"].includes(operacion) &&
        usuario.rol !== "root"
    ) {
        return {
            permitido: false,
            mensaje:
                "Solo el administrador root puede gestionar métodos de pago",
        };
    }
    
    return { permitido: true };
}

/* ================================================
   UTILIDADES Y DESCRIPCIONES
   ================================================ */

/**
 * Obtiene la descripción detallada de permisos para un rol específico
 * 
 * @param {string} rol - Nombre del rol (root, analista, repositor)
 * @returns {string} Descripción de los permisos del rol
 */
function getDescripcionPermisos(rol) {
    const permisos = {
        root: "Acceso completo al sistema. Puede gestionar usuarios, productos y ver todos los reportes.",
        analista:
            "Puede ver reportes y auditorías. No puede modificar datos del sistema.",
        repositor:
            "Puede gestionar productos y categorías. No puede eliminar ni gestionar usuarios.",
    };
    return permisos[rol] || "Permisos limitados";
}

/* ================================================
   EXPORTACIÓN DEL MÓDULO
   ================================================ */

/**
 * Objeto exportado con todas las funciones de validación de permisos
 * Disponible globalmente como window.Permisos
 */
window.Permisos = {
    validarPermisoOperacion,
    validarAccesoEntidad,
    validarOperacionEspecial,
    getDescripcionPermisos,
};
