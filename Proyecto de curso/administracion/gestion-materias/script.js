document.addEventListener('DOMContentLoaded', () => {

    // 1. REFERENCIAS AL DOM
    const btnNuevaMateria = document.querySelector('.btn-nueva-materia');
    const modalMateria = document.getElementById('modal-nueva-materia');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnCancelar = document.getElementById('btn-cancelar');
    const formMateria = document.getElementById('form-nueva-materia');
    const tablaCuerpo = document.getElementById('tabla-cuerpo-materias');
    const modalTituloMateria = document.getElementById('modal-titulo-materia');
    const btnGuardarMateria = document.getElementById('btn-guardar-materia');
    const materiaIdEdicion = document.getElementById('materia-id-edicion');
    const selectProfesor = document.getElementById('profesor-materia');

    // Búsqueda y Filtros
    const inputBusqueda = document.getElementById('input-busqueda');
    const btnFiltrar = document.getElementById('btn-filtrar');
    const panelFiltros = document.getElementById('panel-filtros');
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroNivel = document.getElementById('filtro-nivel');
    const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');

    // Tarjetas de estadísticas
    const numRegistradas = document.querySelectorAll('.tarjeta-estadistica')[0]?.querySelector('.p-numero-estadistica');
    const numPendientes = document.querySelectorAll('.tarjeta-estadistica')[1]?.querySelector('.p-numero-estadistica');

    // Toast de notificación
    const toastNotificacion = document.querySelector('.toast-notificacion');
    const toastMensaje = document.querySelector('.p-toast-mensaje');
    let toastTimeout = null;

    // 2. ESTADO DE LA APLICACIÓN
    let coleccionMaterias = JSON.parse(localStorage.getItem('materiasGuardadas')) || [];
    let terminoBusqueda = '';

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
        localStorage.setItem('materiasGuardadas', JSON.stringify(coleccionMaterias));
    };

    // 3. CARGAR PROFESORES EN EL SELECT 
    const cargarProfesoresEnSelect = (profesorSeleccionado = '') => {
        if (!selectProfesor) return;

        // Leer usuarios registrados para extraer profesores reales
        let usuarios = [];
        try {
            usuarios = JSON.parse(localStorage.getItem('usuariosGuardados')) || [];
        } catch (e) {
            console.error('Error al leer usuariosGuardados:', e);
        }

        const profesores = usuarios.filter(u => u.rol && u.rol.toLowerCase() === 'profesor');

        selectProfesor.innerHTML = '<option value="">Sin profesor asignado (Pendiente)</option>';

        if (profesores.length === 0) {
            const optVacia = document.createElement('option');
            optVacia.value = '';
            optVacia.disabled = true;
            optVacia.textContent = '— No hay profesores registrados en Gestión de Usuarios —';
            selectProfesor.appendChild(optVacia);
        } else {
            profesores.forEach(prof => {
                const opt = document.createElement('option');
                opt.value = prof.nombre;
                opt.textContent = `${prof.nombre}${prof.materias ? ' — (' + prof.materias + ')' : ''}`;
                if (profesorSeleccionado && prof.nombre.trim().toLowerCase() === profesorSeleccionado.trim().toLowerCase()) {
                    opt.selected = true;
                }
                selectProfesor.appendChild(opt);
            });
        }

        // Si la materia tenía un profesor asignado previamente que no está en la lista actual, mantenerlo
        if (profesorSeleccionado && !Array.from(selectProfesor.options).some(o => o.value === profesorSeleccionado)) {
            const optCustom = document.createElement('option');
            optCustom.value = profesorSeleccionado;
            optCustom.textContent = profesorSeleccionado;
            optCustom.selected = true;
            selectProfesor.appendChild(optCustom);
        }
    };

    // 4. FILTRADO DE MATERIAS 
    const obtenerMateriasFiltradas = () => {
        const busq = terminoBusqueda.trim().toLowerCase();
        const estado = filtroEstado ? filtroEstado.value : 'todos';
        const nivel = filtroNivel ? filtroNivel.value : 'todos';

        return coleccionMaterias.filter(materia => {
            // Filtro por Búsqueda (materia o profesor)
            const coincideBusqueda = !busq ||
                (materia.nombre && materia.nombre.toLowerCase().includes(busq)) ||
                (materia.profesor && materia.profesor.toLowerCase().includes(busq)) ||
                (materia.paralelo && materia.paralelo.toLowerCase().includes(busq));

            // Filtro por Estado de Asignación
            let coincideEstado = true;
            const tieneProfesor = materia.profesor && materia.profesor.trim() !== '';
            if (estado === 'asignadas') coincideEstado = tieneProfesor;
            if (estado === 'pendientes') coincideEstado = !tieneProfesor;

            // Filtro por Nivel
            let coincideNivel = true;
            if (nivel !== 'todos') {
                coincideNivel = materia.nivel && materia.nivel.toString() === nivel;
            }

            return coincideBusqueda && coincideEstado && coincideNivel;
        });
    };

    // 5. RENDERIZAR TABLA Y ESTADÍSTICAS
    const actualizarEstadisticas = () => {
        const total = coleccionMaterias.length;
        const pendientes = coleccionMaterias.filter(m => !m.profesor || m.profesor.trim() === '').length;

        if (numRegistradas) numRegistradas.textContent = total;
        if (numPendientes) numPendientes.textContent = pendientes;
    };

    const redibujarInterfaz = () => {
        tablaCuerpo.innerHTML = '';

        const materiasFiltradas = obtenerMateriasFiltradas();

        if (materiasFiltradas.length === 0) {
            tablaCuerpo.innerHTML = `
                <tr class="fila-vacia" id="fila-vacia">
                    <td colspan="5">
                        <div class="estado-vacio" style="text-align: center; padding: 36px; color: #6D7588;">
                            <p class="p-estado-vacio" style="font-weight: 600; margin: 0; font-size: 15px; color: #202435;">No se encontraron materias</p>
                            <p class="p-estado-vacio-sub" style="font-size: 13px; margin: 6px 0 0 0;">Intenta con otros criterios de búsqueda o haz clic en "Nueva Materia".</p>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            materiasFiltradas.forEach((materia) => {
                const nuevaFila = document.createElement('tr');

                const tieneProfesor = materia.profesor && materia.profesor.trim() !== '';
                const profesorTexto = tieneProfesor 
                    ? `<span style="font-weight: 500; color: #202435;">${materia.profesor}</span>` 
                    : '<span style="color: #D69E2E; background-color: #FEF3C7; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Pendiente</span>';

                const nivelTexto = materia.nivel ? `Nivel ${materia.nivel} "${materia.paralelo || 'A'}"` : `"${materia.paralelo || 'A'}"`;

                nuevaFila.innerHTML = `
                    <td class="td-nombre-materia" style="font-weight: 600; color: #202435;">${materia.nombre}</td>
                    <td>${profesorTexto}</td>
                    <td>${nivelTexto}</td>
                    <td>${materia.horas || '4'} horas</td>
                    <td class="td-acciones">
                        <button type="button" class="btn-accion btn-editar" title="Editar" onclick="editarMateria('${materia.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button type="button" class="btn-accion btn-eliminar" title="Eliminar" onclick="removerMateriaPorId('${materia.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                    </td>
                `;
                tablaCuerpo.appendChild(nuevaFila);
            });
        }

        actualizarEstadisticas();
    };

    // 6. EVENTOS DE BÚSQUEDA Y FILTRADO 
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            terminoBusqueda = e.target.value;
            redibujarInterfaz();
        });
    }

    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', () => {
            if (!panelFiltros) return;
            const estaOculto = panelFiltros.style.display === 'none' || panelFiltros.style.display === '';
            panelFiltros.style.display = estaOculto ? 'flex' : 'none';
        });
    }

    const verificarFiltrosActivos = () => {
        const estActivo = filtroEstado && filtroEstado.value !== 'todos';
        const nivActivo = filtroNivel && filtroNivel.value !== 'todos';
        if (btnFiltrar) {
            if (estActivo || nivActivo) {
                btnFiltrar.classList.add('activo');
            } else {
                btnFiltrar.classList.remove('activo');
            }
        }
    };

    if (filtroEstado) {
        filtroEstado.addEventListener('change', () => {
            verificarFiltrosActivos();
            redibujarInterfaz();
        });
    }

    if (filtroNivel) {
        filtroNivel.addEventListener('change', () => {
            verificarFiltrosActivos();
            redibujarInterfaz();
        });
    }

    if (btnLimpiarFiltros) {
        btnLimpiarFiltros.addEventListener('click', () => {
            if (filtroEstado) filtroEstado.value = 'todos';
            if (filtroNivel) filtroNivel.value = 'todos';
            if (inputBusqueda) inputBusqueda.value = '';
            terminoBusqueda = '';
            verificarFiltrosActivos();
            redibujarInterfaz();
        });
    }

    // 7. VALIDACIÓN FORMULARIO 
    function mostrarError(inputId, spanId, mensaje) {
        const inputElem = document.getElementById(inputId);
        const spanElem = document.getElementById(spanId);
        if (inputElem) inputElem.classList.add('input-error');
        if (spanElem) spanElem.innerText = mensaje;
    }

    function limpiarErrores() {
        const inputs = formMateria ? formMateria.querySelectorAll('.input-formulario, .select-formulario') : [];
        const errores = formMateria ? formMateria.querySelectorAll('.error') : [];

        inputs.forEach(input => input.classList.remove('input-error'));
        errores.forEach(span => span.innerText = '');
    }

    // 8. FUNCIONES DEL MODAL
    const abrirModal = () => {
        limpiarErrores();
        cargarProfesoresEnSelect();
        if (modalMateria) modalMateria.style.display = 'flex';
    };

    const cerrarModal = () => {
        if (modalMateria) modalMateria.style.display = 'none';
        if (formMateria) formMateria.reset();
        if (materiaIdEdicion) materiaIdEdicion.value = '';
        if (modalTituloMateria) modalTituloMateria.textContent = 'Nueva Materia';
        if (btnGuardarMateria) btnGuardarMateria.textContent = 'Guardar';
        limpiarErrores();
    };

    if (btnNuevaMateria) {
        btnNuevaMateria.addEventListener('click', () => {
            if (materiaIdEdicion) materiaIdEdicion.value = '';
            if (modalTituloMateria) modalTituloMateria.textContent = 'Nueva Materia';
            if (btnGuardarMateria) btnGuardarMateria.textContent = 'Guardar';
            if (formMateria) formMateria.reset();
            abrirModal();
        });
    }

    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
    if (btnCancelar) btnCancelar.addEventListener('click', cerrarModal);

    window.addEventListener('click', (e) => {
        if (e.target === modalMateria) cerrarModal();
    });

    // 9. EDITAR MATERIA GLOBAL 
    window.editarMateria = function (id) {
        const materia = coleccionMaterias.find(m => m.id === id);
        if (!materia) return;

        limpiarErrores();
        if (materiaIdEdicion) materiaIdEdicion.value = materia.id;
        if (modalTituloMateria) modalTituloMateria.textContent = 'Editar Materia';
        if (btnGuardarMateria) btnGuardarMateria.textContent = 'Actualizar';

        document.getElementById('nombre-materia').value = materia.nombre || '';
        cargarProfesoresEnSelect(materia.profesor || '');
        document.getElementById('nivel-materia').value = materia.nivel || '1';
        document.getElementById('paralelo-materia').value = materia.paralelo || 'A';
        document.getElementById('horas-materia').value = materia.horas || '4';

        if (modalMateria) modalMateria.style.display = 'flex';
    };

    // 10. NOTIFICACIÓN TOAST
    const mostrarToast = (texto = 'Materia guardada exitosamente') => {
        if (!toastNotificacion) return;
        if (toastTimeout) clearTimeout(toastTimeout);

        if (toastMensaje) toastMensaje.textContent = texto;
        toastNotificacion.style.display = 'flex';

        toastTimeout = setTimeout(() => {
            toastNotificacion.style.display = 'none';
        }, 3500);
    };

    // 11. GUARDAR / EDITAR MATERIA
    if (formMateria) {
        formMateria.addEventListener('submit', (e) => {
            e.preventDefault();

            // Limpia los mensajes de error previos
            limpiarErrores();

            let esValido = true;

            const nombre = document.getElementById('nombre-materia').value.trim();
            const profesor = selectProfesor ? selectProfesor.value.trim() : '';
            const nivel = document.getElementById('nivel-materia').value;
            const paralelo = document.getElementById('paralelo-materia').value;
            const horas = document.getElementById('horas-materia').value;
            const idEdicion = materiaIdEdicion ? materiaIdEdicion.value : '';

            // Validación según guia-de-js.js (sin expresiones regulares)
            if (nombre === '') {
                mostrarError('nombre-materia', 'errorNombreMateria', 'El nombre de la materia es obligatorio');
                esValido = false;
            } else if (!isNaN(nombre)) {
                mostrarError('nombre-materia', 'errorNombreMateria', 'El nombre de la materia no puede ser un número');
                esValido = false;
            } else if (nombre.length < 3) {
                mostrarError('nombre-materia', 'errorNombreMateria', 'El nombre debe tener al menos 3 caracteres');
                esValido = false;
            }

            if (esValido) {
                if (idEdicion) {
                    // Modo edición
                    const indice = coleccionMaterias.findIndex(m => m.id === idEdicion);
                    if (indice !== -1) {
                        coleccionMaterias[indice] = {
                            ...coleccionMaterias[indice],
                            nombre,
                            profesor,
                            nivel,
                            paralelo,
                            horas
                        };
                        mostrarToast('Materia actualizada con éxito');
                    }
                } else {
                    // Modo nueva materia
                    const nuevaMateria = {
                        id: Date.now().toString(),
                        nombre,
                        profesor,
                        nivel,
                        paralelo,
                        horas
                    };
                    coleccionMaterias.unshift(nuevaMateria);
                    mostrarToast('Materia registrada con éxito');
                }

                actualizarAlmacenamientoLocal();
                redibujarInterfaz();
                cerrarModal();
            }
        });
    }

    // 12. ELIMINAR MATERIA
    window.removerMateriaPorId = function (id) {
        const materia = coleccionMaterias.find(m => m.id === id);
        const nombreMat = materia ? materia.nombre : 'la materia';

        if (confirm(`¿Estás seguro de que deseas eliminar "${nombreMat}"?`)) {
            coleccionMaterias = coleccionMaterias.filter(m => m.id !== id);
            actualizarAlmacenamientoLocal();
            redibujarInterfaz();
            mostrarToast('Materia eliminada correctamente');
        }
    };

    // Render inicial
    redibujarInterfaz();
});
