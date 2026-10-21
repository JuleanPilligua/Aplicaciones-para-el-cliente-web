document.addEventListener('DOMContentLoaded', () => {

    // 1. REFERENCIAS AL DOM
    const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');
    const modalOverlay = document.getElementById('modal-overlay');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnCancelarModal = document.getElementById('btn-cancelar');
    const formularioUsuario = document.getElementById('formulario-usuario');
    const tablaCuerpo = document.getElementById('tabla-cuerpo-usuarios');
    const modalTitulo = document.getElementById('modal-titulo');
    const btnGuardarUsuario = document.getElementById('btn-guardar-usuario');
    const usuarioIdEdicion = document.getElementById('usuario-id-edicion');

    // Campos condicionales según el rol
    const selectRol = document.getElementById('rol');
    const grupoCamposEstudiante = document.getElementById('grupo-campos-estudiante');
    const grupoCamposProfesor = document.getElementById('grupo-campos-profesor');

    // Filtros y Búsqueda
    const pestanasFiltro = document.getElementById('pestanas-filtro');
    const inputBusqueda = document.getElementById('input-busqueda');

    // Paginación
    const textoPaginacion = document.getElementById('texto-paginacion');
    const paginacionControles = document.getElementById('paginacion-controles');

    // Toast
    const notificacionToast = document.getElementById('toast-notificacion');
    const toastMensaje = notificacionToast ? notificacionToast.querySelector('.toast-mensaje') : null;
    const toastCerrar = document.getElementById('toast-cerrar');
    let toastTimeout = null;

    // 2. ESTADO DE LA APLICACIÓN
    let coleccionUsuarios = JSON.parse(localStorage.getItem('usuariosGuardados')) || [];
    let filtroRolActual = 'todos';
    let terminoBusqueda = '';
    let paginaActual = 1;
    const elementosPorPagina = 5;

    // Cargar usuario en sidebar desde sesión si existe
    try {
        const sesion = JSON.parse(localStorage.getItem('usuarioSesion'));
        if (sesion && sesion.nombre) {
            const elNom = document.getElementById('sidebar-nombre');
            const elRol = document.getElementById('sidebar-rol');
            const elAv = document.getElementById('sidebar-avatar');
            if (elNom) elNom.textContent = sesion.nombre;
            if (elRol) elRol.textContent = sesion.rol || 'Administrador';
            if (elAv) elAv.textContent = sesion.iniciales || 'AZ';
        }
    } catch (e) {}

    // Guardar en LocalStorage
    const actualizarAlmacenamientoLocal = () => {
        localStorage.setItem('usuariosGuardados', JSON.stringify(coleccionUsuarios));
    };

    // 3. ADAPTAR FORMULARIO SEGÚN EL ROL
    const actualizarCamposPorRol = (rol) => {
        if (rol === 'profesor') {
            if (grupoCamposEstudiante) grupoCamposEstudiante.style.display = 'none';
            if (grupoCamposProfesor) grupoCamposProfesor.style.display = 'flex';
        } else if (rol === 'administrador') {
            if (grupoCamposEstudiante) grupoCamposEstudiante.style.display = 'none';
            if (grupoCamposProfesor) grupoCamposProfesor.style.display = 'none';
        } else {
            // 'estudiante'
            if (grupoCamposEstudiante) grupoCamposEstudiante.style.display = 'flex';
            if (grupoCamposProfesor) grupoCamposProfesor.style.display = 'none';
        }
    };

    if (selectRol) {
        selectRol.addEventListener('change', (e) => {
            actualizarCamposPorRol(e.target.value);
        });
    }

    // 4. OBTENER USUARIOS FILTRADOS
    const obtenerUsuariosFiltrados = () => {
        return coleccionUsuarios.filter(usuario => {
            // Filtro por Rol
            const coincideRol = (filtroRolActual === 'todos') || 
                                (usuario.rol && usuario.rol.toLowerCase() === filtroRolActual.toLowerCase());

            // Filtro por Búsqueda (nombre, cédula, correo o materias)
            const busq = terminoBusqueda.trim().toLowerCase();
            const coincideBusqueda = !busq || 
                (usuario.nombre && usuario.nombre.toLowerCase().includes(busq)) ||
                (usuario.cedula && usuario.cedula.toLowerCase().includes(busq)) ||
                (usuario.correo && usuario.correo.toLowerCase().includes(busq)) ||
                (usuario.materias && usuario.materias.toLowerCase().includes(busq));

            return coincideRol && coincideBusqueda;
        });
    };

    // 5. RENDERIZAR TABLA Y PAGINACIÓN
    const redibujarInterfaz = () => {
        tablaCuerpo.innerHTML = '';

        const filtrados = obtenerUsuariosFiltrados();
        const totalRegistros = filtrados.length;
        const totalPaginas = Math.ceil(totalRegistros / elementosPorPagina) || 1;

        if (paginaActual > totalPaginas) paginaActual = totalPaginas;
        if (paginaActual < 1) paginaActual = 1;

        const indiceInicio = (paginaActual - 1) * elementosPorPagina;
        const indiceFin = Math.min(indiceInicio + elementosPorPagina, totalRegistros);
        const usuariosPagina = filtrados.slice(indiceInicio, indiceFin);

        if (totalRegistros === 0) {
            tablaCuerpo.innerHTML = `
                <tr class="fila-vacia" id="fila-vacia">
                    <td colspan="5">
                        <div class="estado-vacio">
                            <p class="p-estado-vacio">No hay usuarios que coincidan con el criterio</p>
                            <p class="p-estado-vacio-sub">Intenta con otro filtro o haz clic en "+ Nuevo Usuario".</p>
                        </div>
                    </td>
                </tr>
            `;
            if (textoPaginacion) textoPaginacion.textContent = 'Mostrando 0 usuarios';
            if (paginacionControles) paginacionControles.innerHTML = '';
            return;
        }

        // Renderizar filas de la página actual
        usuariosPagina.forEach((usuario) => {
            const nuevaFila = document.createElement('tr');
            const rolFormateado = usuario.rol ? (usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)) : 'Usuario';

            // Detalle dinámico según el rol
            let detalleHtml = '—';
            if (usuario.rol === 'estudiante') {
                const niv = usuario.nivel || '—';
                const par = usuario.paralelo ? `"${usuario.paralelo}"` : '';
                detalleHtml = `<span class="celda-nivel">${niv} ${par}</span>`;
            } else if (usuario.rol === 'profesor') {
                const materiasTexto = usuario.materias ? usuario.materias : 'Sin materias';
                detalleHtml = `<span class="detalle-materias" title="${materiasTexto}">${materiasTexto}</span>`;
            } else if (usuario.rol === 'administrador') {
                detalleHtml = `<span class="detalle-admin">—</span>`;
            }

            nuevaFila.innerHTML = `
                <td>
                    <div class="celda-usuario">
                        <div class="avatar-tabla avatar-azul">${usuario.iniciales || 'US'}</div>
                        <div class="info-nombre-usuario">
                            <span class="nombre-persona">${usuario.nombre}</span>
                            <span class="correo-persona">${usuario.correo}</span>
                        </div>
                    </div>
                </td>
                <td class="celda-cedula">${usuario.cedula}</td>
                <td><span class="badge-rol badge-${usuario.rol}">${rolFormateado}</span></td>
                <td>${detalleHtml}</td>
                <td class="celda-acciones">
                    <button type="button" class="boton-accion" title="Editar" onclick="editarUsuario('${usuario.codigo}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button type="button" class="boton-accion boton-eliminar" title="Eliminar" onclick="removerUsuarioPorCodigo('${usuario.codigo}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                </td>
            `;
            tablaCuerpo.appendChild(nuevaFila);
        });

        // Actualizar pie de paginación
        if (textoPaginacion) {
            textoPaginacion.textContent = `Mostrando ${indiceInicio + 1}-${indiceFin} de ${totalRegistros} usuarios`;
        }

        renderizarPaginacion(totalPaginas);
    };

    // Generar botones de paginación
    const renderizarPaginacion = (totalPaginas) => {
        if (!paginacionControles) return;
        paginacionControles.innerHTML = '';

        if (totalPaginas <= 1) return;

        // Botón Anterior
        const btnAnt = document.createElement('button');
        btnAnt.type = 'button';
        btnAnt.className = 'boton-pagina boton-siguiente';
        btnAnt.innerHTML = '&laquo;';
        btnAnt.title = 'Página anterior';
        btnAnt.disabled = paginaActual === 1;
        btnAnt.style.opacity = paginaActual === 1 ? '0.5' : '1';
        btnAnt.style.cursor = paginaActual === 1 ? 'not-allowed' : 'pointer';
        btnAnt.onclick = () => {
            if (paginaActual > 1) {
                paginaActual--;
                redibujarInterfaz();
            }
        };
        paginacionControles.appendChild(btnAnt);

        // Botones numéricos
        for (let i = 1; i <= totalPaginas; i++) {
            const btnPag = document.createElement('button');
            btnPag.type = 'button';
            btnPag.className = `boton-pagina ${i === paginaActual ? 'activo' : ''}`;
            btnPag.textContent = i;
            btnPag.onclick = () => {
                paginaActual = i;
                redibujarInterfaz();
            };
            paginacionControles.appendChild(btnPag);
        }

        // Botón Siguiente
        const btnSig = document.createElement('button');
        btnSig.type = 'button';
        btnSig.className = 'boton-pagina boton-siguiente';
        btnSig.innerHTML = '&raquo;';
        btnSig.title = 'Página siguiente';
        btnSig.disabled = paginaActual === totalPaginas;
        btnSig.style.opacity = paginaActual === totalPaginas ? '0.5' : '1';
        btnSig.style.cursor = paginaActual === totalPaginas ? 'not-allowed' : 'pointer';
        btnSig.onclick = () => {
            if (paginaActual < totalPaginas) {
                paginaActual++;
                redibujarInterfaz();
            }
        };
        paginacionControles.appendChild(btnSig);
    };

    // 6. EVENTOS DE FILTROS Y BÚSQUEDA
    if (pestanasFiltro) {
        pestanasFiltro.addEventListener('click', (e) => {
            const btn = e.target.closest('.boton-filtro');
            if (!btn) return;

            pestanasFiltro.querySelectorAll('.boton-filtro').forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');

            filtroRolActual = btn.getAttribute('data-rol') || 'todos';
            paginaActual = 1;
            redibujarInterfaz();
        });
    }

    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            terminoBusqueda = e.target.value;
            paginaActual = 1;
            redibujarInterfaz();
        });
    }

    // 7. FUNCIONES DE VALIDACIÓN 
    function mostrarError(inputId, spanId, mensaje) {
        const inputElem = document.getElementById(inputId);
        const spanElem = document.getElementById(spanId);
        if (inputElem) inputElem.classList.add('input-error');
        if (spanElem) spanElem.innerText = mensaje;
    }

    function limpiarErrores() {
        const inputs = formularioUsuario ? formularioUsuario.querySelectorAll('.input-formulario') : [];
        const errores = formularioUsuario ? formularioUsuario.querySelectorAll('.error') : [];

        inputs.forEach(input => input.classList.remove('input-error'));
        errores.forEach(span => span.innerText = '');
    }

    // 8. MODAL (ABRIR, CERRAR, EDITAR)
    const abrirModal = () => {
        limpiarErrores();
        if (modalOverlay) modalOverlay.style.display = 'flex';
    };

    const cerrarModal = () => {
        if (modalOverlay) modalOverlay.style.display = 'none';
        if (formularioUsuario) formularioUsuario.reset();
        if (usuarioIdEdicion) usuarioIdEdicion.value = '';
        if (modalTitulo) modalTitulo.textContent = 'Nuevo Usuario';
        if (btnGuardarUsuario) btnGuardarUsuario.textContent = 'Guardar';
        if (selectRol) selectRol.value = 'estudiante';
        actualizarCamposPorRol('estudiante');
        limpiarErrores();
    };

    if (btnNuevoUsuario) {
        btnNuevoUsuario.addEventListener('click', () => {
            if (usuarioIdEdicion) usuarioIdEdicion.value = '';
            if (modalTitulo) modalTitulo.textContent = 'Nuevo Usuario';
            if (btnGuardarUsuario) btnGuardarUsuario.textContent = 'Guardar';
            if (formularioUsuario) formularioUsuario.reset();
            if (selectRol) selectRol.value = 'estudiante';
            actualizarCamposPorRol('estudiante');
            abrirModal();
        });
    }

    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
    if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModal);

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) cerrarModal();
        });
    }

    // Editar usuario global
    window.editarUsuario = function (codigo) {
        const usuario = coleccionUsuarios.find(u => u.codigo === codigo);
        if (!usuario) return;

        limpiarErrores();
        if (usuarioIdEdicion) usuarioIdEdicion.value = usuario.codigo;
        if (modalTitulo) modalTitulo.textContent = 'Editar Usuario';
        if (btnGuardarUsuario) btnGuardarUsuario.textContent = 'Actualizar';

        document.getElementById('nombre-completo').value = usuario.nombre || '';
        document.getElementById('cedula').value = usuario.cedula || '';
        document.getElementById('correo').value = usuario.correo || '';
        document.getElementById('contrasena').value = usuario.contrasena || '';

        const rolUsuario = usuario.rol || 'estudiante';
        if (selectRol) selectRol.value = rolUsuario;
        actualizarCamposPorRol(rolUsuario);

        if (rolUsuario === 'estudiante') {
            document.getElementById('nivel').value = usuario.nivel || '1';
            document.getElementById('paralelo').value = usuario.paralelo || 'A';
        } else if (rolUsuario === 'profesor') {
            const inputMat = document.getElementById('materias-profesor');
            if (inputMat) inputMat.value = usuario.materias || '';
        }

        if (modalOverlay) modalOverlay.style.display = 'flex';
    };

    // 9. NOTIFICACIÓN TOAST
    const mostrarToast = (mensaje = 'Operación realizada con éxito') => {
        if (!notificacionToast) return;
        if (toastTimeout) clearTimeout(toastTimeout);

        if (toastMensaje) toastMensaje.textContent = mensaje;
        notificacionToast.style.display = 'flex';

        toastTimeout = setTimeout(() => {
            ocultarToast();
        }, 3500);
    };

    const ocultarToast = () => {
        if (notificacionToast) notificacionToast.style.display = 'none';
        if (toastTimeout) clearTimeout(toastTimeout);
    };

    if (toastCerrar) toastCerrar.addEventListener('click', ocultarToast);

    // 10. ENVÍO DE FORMULARIO CON VALIDACIONES 
    if (formularioUsuario) {
        formularioUsuario.addEventListener('submit', (e) => {
            e.preventDefault();

            // Limpia los mensajes de error y los bordes rojos
            limpiarErrores();

            let esValido = true;

            // Obtener los valores ingresados quitando espacios al inicio y al final (.trim())
            const nombre = document.getElementById('nombre-completo').value.trim();
            const cedula = document.getElementById('cedula').value.trim();
            const correo = document.getElementById('correo').value.trim();
            const contrasena = document.getElementById('contrasena').value.trim();
            const rol = selectRol ? selectRol.value : 'estudiante';
            const idEdicion = usuarioIdEdicion ? usuarioIdEdicion.value : '';

            // 1. Comprueba que el nombre no esté vacío y no sea un número (guia-de-js.js)
            if (nombre === '') {
                mostrarError('nombre-completo', 'errorNombre', 'El nombre es obligatorio');
                esValido = false;
            } else if (!isNaN(nombre)) {
                mostrarError('nombre-completo', 'errorNombre', 'El nombre no puede ser un número');
                esValido = false;
            }

            // 2. isNaN verifica si no es número, y .length comprueba que tenga exactamente 10 caracteres
            if (isNaN(cedula) || cedula.length !== 10 || cedula === '') {
                mostrarError('cedula', 'errorCedula', 'Debe ingresar exactamente 10 números');
                esValido = false;
            }

            // 3. Verifica que incluya '@' y un punto '.', además de no estar vacío
            if (!correo.includes('@') || !correo.includes('.') || correo === '') {
                mostrarError('correo', 'errorCorreo', 'Ingrese un correo válido (ejemplo@dominio.com)');
                esValido = false;
            }

            // 4. Comprueba contraseña obligatoria y mínimo 8 caracteres
            if (contrasena === '') {
                mostrarError('contrasena', 'errorContrasena', 'La contraseña es obligatoria');
                esValido = false;
            } else if (contrasena.length < 8) {
                mostrarError('contrasena', 'errorContrasena', 'La contraseña debe tener al menos 8 caracteres');
                esValido = false;
            }

            // 5. Validación condicional según el rol
            let nivelVal = null;
            let paraleloVal = null;
            let materiasVal = null;

            if (rol === 'estudiante') {
                nivelVal = document.getElementById('nivel').value;
                paraleloVal = document.getElementById('paralelo').value;
            } else if (rol === 'profesor') {
                const elemMat = document.getElementById('materias-profesor');
                materiasVal = elemMat ? elemMat.value.trim() : '';
                if (materiasVal === '') {
                    mostrarError('materias-profesor', 'errorMaterias', 'Debe ingresar al menos una materia');
                    esValido = false;
                }
            } else if (rol === 'administrador') {
                // Administrador no lleva nivel, paralelo ni materias
                nivelVal = null;
                paraleloVal = null;
                materiasVal = null;
            }

            // Si todas las validaciones pasaron correctamente
            if (esValido) {
                // Calcular iniciales de manera segura (ej. Carlos Mendoza -> CM)
                const partes = nombre.split(' ').filter(Boolean);
                let inicialesVal = 'US';
                if (partes.length === 1) {
                    inicialesVal = partes[0].substring(0, 2).toUpperCase();
                } else if (partes.length >= 2) {
                    inicialesVal = (partes[0][0] + partes[1][0]).toUpperCase();
                }

                if (idEdicion) {
                    // Modo edición
                    const indice = coleccionUsuarios.findIndex(u => u.codigo === idEdicion);
                    if (indice !== -1) {
                        coleccionUsuarios[indice] = {
                            ...coleccionUsuarios[indice],
                            nombre,
                            cedula,
                            correo,
                            contrasena,
                            rol,
                            nivel: nivelVal,
                            paralelo: paraleloVal,
                            materias: materiasVal,
                            iniciales: inicialesVal
                        };
                        mostrarToast('Usuario actualizado con éxito');
                    }
                } else {
                    // Modo nuevo usuario
                    const nuevoUsuario = {
                        codigo: Date.now().toString(),
                        nombre,
                        cedula,
                        correo,
                        contrasena,
                        rol,
                        nivel: nivelVal,
                        paralelo: paraleloVal,
                        materias: materiasVal,
                        iniciales: inicialesVal
                    };
                    coleccionUsuarios.unshift(nuevoUsuario);
                    mostrarToast('¡Usuario registrado con éxito!');
                }

                actualizarAlmacenamientoLocal();
                redibujarInterfaz();
                cerrarModal();
            }
        });
    }

    // 11. ELIMINAR USUARIO POR CÓDIGO 
    window.removerUsuarioPorCodigo = function (codigo) {
        const usuario = coleccionUsuarios.find(u => u.codigo === codigo);
        const nombreUsuario = usuario ? usuario.nombre : 'el usuario';

        if (confirm(`¿Estás seguro de que deseas eliminar a ${nombreUsuario}?`)) {
            coleccionUsuarios = coleccionUsuarios.filter(u => u.codigo !== codigo);
            actualizarAlmacenamientoLocal();
            redibujarInterfaz();
            mostrarToast('Usuario eliminado correctamente');
        }
    };

    // Renderizado inicial al cargar la página
    actualizarCamposPorRol(selectRol ? selectRol.value : 'estudiante');
    redibujarInterfaz();
});
