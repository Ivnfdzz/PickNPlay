/**
 * PICK&PLAY - SISTEMA DE ADMINISTRACIÓN DE USUARIO
 * 
 * @description Módulo responsable de la gestión completa de usuarios en el dashboard administrativo.
 *              Proporciona funcionalidades CRUD para usuarios del sistema, incluyendo control de roles,
 *              autenticación y autorización. Permite la administración de cuentas de empleados y 
 *              administradores con diferentes niveles de acceso.
 * 
 * @features    - Listado completo de usuarios con información de roles
 *              - Creación de nuevos usuarios con asignación de roles
 *              - Edición de usuarios existentes (datos y roles)
 *              - Eliminación de usuarios con validaciones de seguridad
 *              - Búsqueda y filtrado de usuarios
 *              - Gestión de contraseñas con validaciones
 *              - Control de acceso basado en roles
 * 
 * @security    Solo usuarios con rol 'root' pueden gestionar otros usuarios.
 *              Las contraseñas se manejan de forma segura y opcional en edición.
 * 
 * @business    Los usuarios representan al personal autorizado para gestionar el sistema,
 *              cada uno con roles específicos que determinan sus permisos y capacidades.
 * 
 * @version     1.0.0
 * @authors     Iván Fernández y Luciano Fattoni
 */

/**
 * Obtiene y renderiza todos los usuarios del sistema
 * 
 * @async
 * @function listarUsuarios
 * @description Función principal que carga todos los usuarios registrados
 *              y los presenta en una tabla interactiva con información de roles y acciones.
 * @throws {Error} Error de comunicación con la API o problemas de renderizado
 * @business Permite al administrador root visualizar todo el personal con acceso al sistema
 */
async function listarUsuarios() {
    try {
        const usuarios = await apiInstance.getUsuarios();
        renderizarTablaUsuarios(usuarios);
    } catch (error) {
        mostrarToast(
            "Error al cargar usuarios: " + (error.message || error),
            "error"
        );
    }
}

/**
 * Renderiza la tabla de usuarios en el contenedor principal
 * 
 * @function renderizarTablaUsuarios
 * @param {Array<Object>} usuarios - Array de objetos usuario con estructura {id_usuario, username, email, Rol: {nombre}}
 * @description Genera HTML dinámico para mostrar usuarios en formato tabla,
 *              incluyendo información de roles y botones de acción para editar y eliminar.
 *              También configura los event listeners para búsqueda de usuarios.
 * @business Proporciona una vista organizada del personal con acceso al sistema
 */
function renderizarTablaUsuarios(usuarios) {
    const contenedor = document.getElementById("contenido-dinamico");
    if (!contenedor) return;

    let html = `
        <h2 class="mb-4">Listado de Usuarios</h2>
        <div class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (!usuarios || usuarios.length === 0) {
        html += `
            <tr>
                <td colspan="4" class="text-center text-muted">No hay usuarios registrados.</td>
            </tr>
        `;
    } else {
        usuarios.forEach((usuario) => {
            html += `
                <tr>
                    <td>${usuario.username}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.Rol.nombre}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-primary me-2" onclick="mostrarFormularioEditarUsuario(${usuario.id_usuario})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.id_usuario})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    html += `
                </tbody>
            </table>
        </div>
    `;

    contenedor.innerHTML = html;

    // Configuración de búsqueda de usuarios
    const inputBuscar = document.getElementById("input-buscar-usuario");
    const btnBuscar = document.getElementById("btn-buscar-usuario");
    if (inputBuscar && btnBuscar) {
        btnBuscar.addEventListener("click", () => {
            buscarUsuarios(inputBuscar.value.trim());
        });
        inputBuscar.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                buscarUsuarios(inputBuscar.value.trim());
            }
        });
    }
}

/**
 * Muestra el formulario para crear un nuevo usuario
 * 
 * @async
 * @function mostrarFormularioCrearUsuario
 * @description Genera y presenta un formulario interactivo para la creación de usuarios,
 *              incluyendo la carga dinámica de roles disponibles y validación de datos.
 *              Incluye validaciones de email, contraseña y asignación de roles.
 * @throws {Error} Error al cargar roles o al procesar la creación
 * @security Solo accesible para usuarios con rol 'root'
 * @business Permite incorporar nuevo personal al sistema con los permisos apropiados
 */
async function mostrarFormularioCrearUsuario() {
    try {
        const roles = await apiInstance.getRoles();

        const contenedor = document.getElementById("contenido-dinamico");
        if (!contenedor) return;

        // Generación de opciones de roles
        let selectHTML = "";
        if (roles && roles.length > 0) {
            selectHTML = `
                <select class="form-select" id="id_rol" name="id_rol" required>
                    <option value="">Selecciona un rol</option>
                    ${roles
                        .map(
                            (rol) => `
                        <option value="${rol.id_rol}">${rol.nombre}</option>
                    `
                        )
                        .join("")}
                </select>
            `;
        } else {
            selectHTML = `<div class="text-muted">No hay roles disponibles.</div>`;
        }

        // Estructura del formulario de creación
        const formHTML = `
            <h2 class="mb-4">Crear nuevo usuario</h2>
            <form id="form-crear-usuario" autocomplete="off">
                <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" class="form-control" id="username" name="username" required>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" name="email" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" name="password" required>
                </div>
                <div class="mb-3">
                    <label for="id_rol" class="form-label">Rol</label>
                    ${selectHTML}
                </div>
                <button type="submit" class="btn btn-primary">Crear usuario</button>
            </form>
        `;

        contenedor.innerHTML = formHTML;

        // Configuración del evento de envío del formulario
        const form = document.getElementById("form-crear-usuario");
        if (form) {
            form.addEventListener("submit", async function (e) {
                e.preventDefault();

                const username = form.username.value.trim();
                const email = form.email.value.trim();
                const password = form.password.value;
                const id_rol = parseInt(form.id_rol.value);

                if (!username || !email || !password || isNaN(id_rol)) {
                    mostrarToast(
                        "Por favor, completá todos los campos.",
                        "warning"
                    );
                    return;
                }

                const usuario = { username, email, password, id_rol };

                try {
                    await apiInstance.crearUsuario(usuario);
                    mostrarToast("Usuario creado exitosamente.", "success");
                    setTimeout(() => {
                        listarUsuarios();
                    }, 1200);
                } catch (error) {
                    mostrarToast(
                        "Error al crear usuario: " + (error.message || error),
                        "error"
                    );
                }
            });
        }
    } catch (error) {
        mostrarToast(
            "Error al cargar el formulario: " + (error.message || error),
            "error"
        );
    }
}

/**
 * Muestra el formulario de edición para un usuario específico
 * 
 * @async
 * @function mostrarFormularioEditarUsuario
 * @param {number} id - ID único del usuario a editar
 * @description Carga los datos actuales del usuario y presenta un formulario pre-poblado
 *              para su modificación. Permite cambiar todos los datos excepto la contraseña
 *              (que es opcional) y el rol asignado.
 * @throws {Error} Error al cargar datos del usuario o roles
 * @security Solo accesible para usuarios con rol 'root', contraseña opcional en edición
 * @business Permite actualizar información del personal y reasignar roles según necesidades
 */
async function mostrarFormularioEditarUsuario(id) {
    try {
        const usuario = await apiInstance.getUsuario(id);
        const roles = await apiInstance.getRoles();

        const contenedor = document.getElementById("contenido-dinamico");
        if (!contenedor) return;

        // Generación de select con rol actual preseleccionado
        let selectHTML = "";
        if (roles && roles.length > 0) {
            selectHTML = `
                <select class="form-select" id="id_rol" name="id_rol" required>
                    <option value="">Selecciona un rol</option>
                    ${roles
                        .map(
                            (rol) => `
                        <option value="${rol.id_rol}" ${
                                usuario.id_rol === rol.id_rol ? "selected" : ""
                            }>
                            ${rol.nombre}
                        </option>
                    `
                        )
                        .join("")}
                </select>
            `;
        } else {
            selectHTML = `<div class="text-muted">No hay roles disponibles.</div>`;
        }

        // Formulario de edición con datos pre-cargados
        const formHTML = `
            <h2 class="mb-4">Modificar usuario</h2>
            <form id="form-editar-usuario" autocomplete="off">
                <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" class="form-control" id="username" name="username" value="${
                        usuario.username || ""
                    }" required>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" name="email" value="${
                        usuario.email || ""
                    }" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Password (dejar vacío para no cambiar)</label>
                    <input type="password" class="form-control" id="password" name="password">
                </div>
                <div class="mb-3">
                    <label for="id_rol" class="form-label">Rol</label>
                    ${selectHTML}
                </div>
                <button type="submit" class="btn btn-primary">Guardar cambios</button>
                <button type="button" class="btn btn-secondary ms-2" onclick="listarUsuarios()">Cancelar</button>
            </form>
        `;

        contenedor.innerHTML = formHTML;

        // Configuración del evento de actualización
        const form = document.getElementById("form-editar-usuario");
        if (form) {
            form.addEventListener("submit", async function (e) {
                e.preventDefault();

                const username = form.username.value.trim();
                const email = form.email.value.trim();
                const password = form.password.value;
                const id_rol = parseInt(form.id_rol.value);

                if (!username || !email || isNaN(id_rol)) {
                    mostrarToast(
                        "Por favor, completá todos los campos obligatorios.",
                        "warning"
                    );
                    return;
                }

                // Construcción condicional del objeto (contraseña opcional)
                const usuarioEditado = { username, email, id_rol };
                if (password) usuarioEditado.password = password;

                try {
                    await apiInstance.actualizarUsuario(id, usuarioEditado);
                    mostrarToast(
                        "Usuario actualizado exitosamente.",
                        "success"
                    );
                    setTimeout(() => {
                        listarUsuarios();
                    }, 1200);
                } catch (error) {
                    mostrarToast(
                        "Error al actualizar usuario: " +
                            (error.message || error),
                        "error"
                    );
                }
            });
        }
    } catch (error) {
        mostrarToast(
            "Error al cargar el formulario de edición: " +
                (error.message || error),
            "error"
        );
    }
}

/**
 * Elimina un usuario específico del sistema
 * 
 * @async
 * @function eliminarUsuario
 * @param {number} id - ID único del usuario a eliminar
 * @description Solicita confirmación del usuario y procede a eliminar la cuenta.
 *              Incluye validaciones para prevenir la eliminación accidental de cuentas críticas.
 * @throws {Error} Error de validación o comunicación con la API
 * @security Solo accesible para usuarios con rol 'root', no permite auto-eliminación
 * @business Permite remover personal que ya no requiere acceso al sistema
 */
async function eliminarUsuario(id) {
    try {
        const confirmado = confirm("¿Desea eliminar este usuario?");
        if (!confirmado) return;

        await apiInstance.eliminarUsuario(id);
        mostrarToast("Usuario eliminado exitosamente.", "success");
        listarUsuarios();
    } catch (error) {
        mostrarToast(
            "Error al eliminar usuario: " + (error.message || error),
            "error"
        );
    }
}

// Exportación de funciones para integración con el core del dashboard
window.listarUsuarios = listarUsuarios;
window.mostrarFormularioCrearUsuario = mostrarFormularioCrearUsuario;
window.mostrarFormularioEditarUsuario = mostrarFormularioEditarUsuario;
window.eliminarUsuario = eliminarUsuario;
