// Configuración de permisos por rol
const PERMISOS_SISTEMA = {
    root: ["all"], // Root puede hacer todo
    analista: ["listar", "buscar"], // Solo ver y buscar
    repositor: ["crear", "listar", "buscar"], // No puede eliminar
};

// Devuelve true si el usuario tiene permiso para la operación en la entidad
function validarPermisoOperacion(usuario, entidad, operacion) {
    const permisosUsuario = PERMISOS_SISTEMA[usuario.rol];
    if (!permisosUsuario) return false;
    if (permisosUsuario.includes("all")) return true;
    return permisosUsuario.includes(operacion);
}

// Devuelve true si el usuario puede acceder a la entidad
function validarAccesoEntidad(usuario, entidad) {
    if (entidad === "usuarios" && usuario.rol !== "root") return false;
    if (entidad === "auditoria" && !["root", "analista"].includes(usuario.rol))
        return false;
    return true;
}

// Devuelve { permitido: true/false, mensaje: string } para validaciones especiales
function validarOperacionEspecial(usuario, entidad, operacion) {
    if (entidad === "pedidos" && operacion === "crear") {
        return {
            permitido: false,
            mensaje: "Solo clientes pueden crear pedidos desde la tienda",
        };
    }
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

// Descripción de permisos por rol
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

// Exportar funciones globalmente
window.Permisos = {
    validarPermisoOperacion,
    validarAccesoEntidad,
    validarOperacionEspecial,
    getDescripcionPermisos,
};
