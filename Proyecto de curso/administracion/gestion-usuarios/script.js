document.addEventListener('DOMContentLoaded', () => {
    const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');
    const modalOverlay = document.getElementById('modal-overlay');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnCancelarModal = document.getElementById('btn-cancelar');
    const formularioUsuario = document.getElementById('formulario-usuario');
    const tablaCuerpo = document.getElementById('tabla-cuerpo-usuarios');

    // Referencias corregidas apuntando a los IDs reales del HTML
    const Notificacion = document.getElementById('toast-notificacion');
    const Cerrar = document.getElementById('toast-cerrar');
    let Timeout = null;

    // ==========================================
    // 2. ESTADO DE LA APLICACIÓN (LocalStorage)
    // ==========================================
    let coleccionUsuarios = JSON.parse(localStorage.getItem('usuariosGuardados')) || [];

    // Función para guardar en LocalStorage
    const actualizarAlmacenamientoLocal = () => {
        localStorage.setItem('usuariosGuardados', JSON.stringify(coleccionUsuarios));
    };

    // ==========================================
    // 3. RENDERIZAR TABLA Y ESTADO VACÍO
    // ==========================================
    const redibujarInterfaz = () => {
        tablaCuerpo.innerHTML = ''; // Vaciar la tabla antes de pintar

        if (coleccionUsuarios.length === 0) {
            // Si no hay registros, usa las clases puras de CSS
            tablaCuerpo.innerHTML = `
                <tr class="fila-vacia" id="fila-vacia">
                    <td colspan="5">
                        <div class="estado-vacio">
                            <p class="p-estado-vacio">No hay usuarios registrados</p>
                            <p class="p-estado-vacio-sub">Haz clic en "+ Nuevo Usuario" para agregar uno.</p>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            // Si hay registros, recorrer el arreglo y agregarlos a la tabla
            coleccionUsuarios.forEach((usuario, indice) => {
                const nuevaFila = document.createElement('tr');
                
                const rolFormateado = usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1);
                
                nuevaFila.innerHTML = `
                    <td>
                        <div class="celda-usuario">
                            <div class="avatar-tabla avatar-azul">${usuario.iniciales}</div>
                            <div class="info-nombre-usuario">
                                <span class="nombre-persona">${usuario.nombre}</span>
                                <span class="correo-persona">${usuario.correo}</span>
                            </div>
                        </div>
                    </td>
                    <td class="celda-cedula">${usuario.cedula}</td>
                    <td><span class="badge-rol badge-${usuario.rol}">${rolFormateado}</span></td>
                    <td class="celda-nivel">${usuario.nivel} "${usuario.paralelo}"</td>
                    <td class="celda-acciones">
                        <button type="button" class="boton-accion" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button type="button" class="boton-accion boton-eliminar" title="Eliminar" onclick="removerUsuario(${indice})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </td>
                `;
                tablaCuerpo.appendChild(nuevaFila);
            });
        }
    };

    // ==========================================
    // 4. LÓGICA DEL MODAL
    // ==========================================
    const abrirModal = () => {
        if (modalOverlay) modalOverlay.style.display = 'flex';
    };

    const cerrarModal = () => {
        if (modalOverlay) modalOverlay.style.display = 'none';
        if (formularioUsuario) formularioUsuario.reset();
    };

    if (btnNuevoUsuario) btnNuevoUsuario.addEventListener('click', abrirModal);
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
    if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModal);

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) cerrarModal();
        });
    }

    // ==========================================
    // 5. LÓGICA DE NOTIFICACIÓN
    // ==========================================
    const mostrar = () => {
        if (!Notificacion) return;
        if (Timeout) clearTimeout(Timeout);
        
        Notificacion.style.display = 'flex';
        
        Timeout = setTimeout(() => {
            ocultar();
        }, 3500);
    };

    const ocultar = () => {
        if (Notificacion) Notificacion.style.display = 'none';
        if (Timeout) clearTimeout(Timeout);
    };

    // Corregido: ahora usa la variable 'Cerrar' y la función 'ocultar'
    if (Cerrar) Cerrar.addEventListener('click', ocultar);

    // ==========================================
    // 6. CAPTURAR FORMULARIO Y GUARDAR
    // ==========================================
    if (formularioUsuario) {
        formularioUsuario.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombreVal = document.getElementById('nombre-completo').value;
            // Calcular iniciales automáticamente (ej. Carlos Mendoza -> CM)
            const inicialesVal = nombreVal.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            const nuevoUsuario = {
                codigo: Date.now().toString(),
                nombre: nombreVal,
                cedula: document.getElementById('cedula').value,
                correo: document.getElementById('correo').value,
                rol: document.getElementById('rol').value,
                nivel: document.getElementById('nivel').value,
                paralelo: document.getElementById('paralelo').value,
                iniciales: inicialesVal
            };

            // Agregar al arreglo, actualizar almacenamiento y refrescar interfaz
            coleccionUsuarios.push(nuevoUsuario);
            actualizarAlmacenamientoLocal();
            redibujarInterfaz();

            // Cerrar modal y mostrar notificación (usando la función 'mostrar')
            cerrarModal();
            mostrar();
        });
    }

    // ==========================================
    // 7. ELIMINAR USUARIO GLOBAL
    // ==========================================
    window.removerUsuario = function (indice) {
        coleccionUsuarios.splice(indice, 1);
        actualizarAlmacenamientoLocal();
        redibujarInterfaz();
    };

    // Renderizado inicial al cargar la página
    redibujarInterfaz();
});