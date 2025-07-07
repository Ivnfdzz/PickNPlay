async function listarUsuarios() {
    try {
        // 1. Traer usuarios desde la API
        const usuarios = await apiInstance.getUsuarios();

        // 2. Renderizar tabla
        renderizarTablaUsuarios(usuarios);

    } catch (error) {
        mostrarToast("Error al cargar usuarios: " + (error.message || error), "error");
    }
}

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
        usuarios.forEach(usuario => {
            html += `
                <tr>
                    <td>${usuario.username}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.Rol.nombre}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-2" onclick="mostrarFormularioEditarUsuario(${usuario.id_usuario})">
                            Modificar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.id_usuario})">
                            Eliminar
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

    // Event listener para buscar
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

async function mostrarFormularioCrearUsuario() {
    try {
        // 1. Traer roles desde la API
        const roles = await apiInstance.getRoles();

        // 2. Seleccionar el contenedor central
        const contenedor = document.getElementById("contenido-dinamico");
        if (!contenedor) return;

        // 3. Armar el select de roles
        let selectHTML = "";
        if (roles && roles.length > 0) {
            selectHTML = `
                <select class="form-select" id="id_rol" name="id_rol" required>
                    <option value="">Selecciona un rol</option>
                    ${roles.map(rol => `
                        <option value="${rol.id_rol}">${rol.nombre}</option>
                    `).join("")}
                </select>
            `;
        } else {
            selectHTML = `<div class="text-muted">No hay roles disponibles.</div>`;
        }

        // 4. Armar el HTML del formulario
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

        // 5. Renderizar el formulario
        contenedor.innerHTML = formHTML;

        // 6. Event listener al formulario
        const form = document.getElementById("form-crear-usuario");
        if (form) {
            form.addEventListener("submit", async function (e) {
                e.preventDefault();

                const username = form.username.value.trim();
                const email = form.email.value.trim();
                const password = form.password.value;
                const id_rol = parseInt(form.id_rol.value);

                if (!username || !email || !password || isNaN(id_rol)) {
                    mostrarToast("Por favor, completá todos los campos.", "warning");
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
                    mostrarToast("Error al crear usuario: " + (error.message || error), "error");
                }
            });
        }
    } catch (error) {
        mostrarToast("Error al cargar el formulario: " + (error.message || error), "error");
    }
}

async function mostrarFormularioEditarUsuario(id) {
    try {
        // 1. Traer datos del usuario
        const usuario = await apiInstance.getUsuario(id);

        // 2. Traer todos los roles
        const roles = await apiInstance.getRoles();

        // 3. Seleccionar el contenedor central
        const contenedor = document.getElementById("contenido-dinamico");
        if (!contenedor) return;

        // 4. Armar el select de roles, marcando el actual
        let selectHTML = "";
        if (roles && roles.length > 0) {
            selectHTML = `
                <select class="form-select" id="id_rol" name="id_rol" required>
                    <option value="">Selecciona un rol</option>
                    ${roles.map(rol => `
                        <option value="${rol.id_rol}" ${usuario.id_rol === rol.id_rol ? "selected" : ""}>
                            ${rol.nombre}
                        </option>
                    `).join("")}
                </select>
            `;
        } else {
            selectHTML = `<div class="text-muted">No hay roles disponibles.</div>`;
        }

        // 5. Armar el HTML del formulario
        const formHTML = `
            <h2 class="mb-4">Modificar usuario</h2>
            <form id="form-editar-usuario" autocomplete="off">
                <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" class="form-control" id="username" name="username" value="${usuario.username || ""}" required>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" name="email" value="${usuario.email || ""}" required>
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

        // 6. Renderizar el formulario
        contenedor.innerHTML = formHTML;

        // 7. Event listener al formulario
        const form = document.getElementById("form-editar-usuario");
        if (form) {
            form.addEventListener("submit", async function (e) {
                e.preventDefault();

                const username = form.username.value.trim();
                const email = form.email.value.trim();
                const password = form.password.value;
                const id_rol = parseInt(form.id_rol.value);

                if (!username || !email || isNaN(id_rol)) {
                    mostrarToast("Por favor, completá todos los campos obligatorios.", "warning");
                    return;
                }

                // Solo enviar password si se completó
                const usuarioEditado = { username, email, id_rol };
                if (password) usuarioEditado.password = password;

                try {
                    await apiInstance.actualizarUsuario(id, usuarioEditado);
                    mostrarToast("Usuario actualizado exitosamente.", "success");
                    setTimeout(() => {
                        listarUsuarios();
                    }, 1200);
                } catch (error) {
                    mostrarToast("Error al actualizar usuario: " + (error.message || error), "error");
                }
            });
        }
    } catch (error) {
        mostrarToast("Error al cargar el formulario de edición: " + (error.message || error), "error");
    }
}

async function eliminarUsuario(id) {
    try {
        const confirmado = confirm("¿Desea eliminar este usuario?");
        if (!confirmado) return;

        await apiInstance.eliminarUsuario(id);
        mostrarToast("Usuario eliminado exitosamente.", "success");
        listarUsuarios();
    } catch (error) {
        mostrarToast("Error al eliminar usuario: " + (error.message || error), "error");
    }
}

window.listarUsuarios = listarUsuarios;
window.mostrarFormularioCrearUsuario = mostrarFormularioCrearUsuario;
window.mostrarFormularioEditarUsuario = mostrarFormularioEditarUsuario;
window.eliminarUsuario = eliminarUsuario;