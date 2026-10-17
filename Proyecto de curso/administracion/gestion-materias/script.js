document.addEventListener('DOMContentLoaded', () => {

    // Referencias del DOM
    const btnNuevaMateria = document.querySelector('.btn-nueva-materia');
    const modalMateria = document.getElementById('modal-nueva-materia');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnCancelar = document.getElementById('btn-cancelar');
    const formMateria = document.getElementById('form-nueva-materia');
    const tablaCuerpo = document.getElementById('tabla-cuerpo-materias');
    
    // Tarjetas de estadísticas
    const numRegistradas = document.querySelectorAll('.tarjeta-estadistica')[0]?.querySelector('.p-numero-estadistica');
    const numPendientes = document.querySelectorAll('.tarjeta-estadistica')[1]?.querySelector('.p-numero-estadistica');

    // Toast de notificación
    const toastNotificacion = document.querySelector('.toast-notificacion');
    const toastMensaje = document.querySelector('.p-toast-mensaje');
    let toastTimeout = null;

    // Estado de la aplicación (LocalStorage)
    let coleccionMaterias = JSON.parse(localStorage.getItem('materiasGuardadas')) || [];

    const actualizarAlmacenamientoLocal = () => {
        localStorage.setItem('materiasGuardadas', JSON.stringify(coleccionMaterias));
    };

    // Función para mostrar notificación Toast
    const mostrarToast = (texto = 'Materia guardada exitosamente') => {
        if (!toastNotificacion) return;
        if (toastTimeout) clearTimeout(toastTimeout);

        if (toastMensaje) toastMensaje.textContent = texto;
        toastNotificacion.style.display = 'flex';

        toastTimeout = setTimeout(() => {
            toastNotificacion.style.display = 'none';
        }, 3500);
    };

    // Actualizar solo las tarjetas superiores
    const actualizarEstadisticas = () => {
        const total = coleccionMaterias.length;
        const pendientes = coleccionMaterias.filter(m => !m.profesor || m.profesor.trim() === '').length;

        if (numRegistradas) numRegistradas.textContent = total;
        if (numPendientes) numPendientes.textContent = pendientes;
    };

    // Redibujar la tabla con LocalStorage
    const redibujarInterfaz = () => {
        tablaCuerpo.innerHTML = '';

        if (coleccionMaterias.length === 0) {
            tablaCuerpo.innerHTML = `
                <tr class="fila-vacia" id="fila-vacia">
                    <td colspan="5">
                        <div class="estado-vacio" style="text-align: center; padding: 30px; color: #6D7588;">
                            <p class="p-estado-vacio" style="font-weight: 600; margin: 0;">No hay materias registradas</p>
                            <p class="p-estado-vacio-sub" style="font-size: 12px; margin: 4px 0 0 0;">Haz clic en "Nueva Materia" para agregar una.</p>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            coleccionMaterias.forEach((materia, indice) => {
                const nuevaFila = document.createElement('tr');

                const profesorTexto = materia.profesor && materia.profesor.trim() !== '' ? materia.profesor : '<span class="td-vacio">—</span>';
                const paraleloTexto = materia.paralelo ? materia.paralelo : '<span class="td-vacio">—</span>';

                nuevaFila.innerHTML = `
                    <td class="td-nombre-materia">${materia.nombre}</td>
                    <td>${profesorTexto}</td>
                    <td>${paraleloTexto}</td>
                    <td>${materia.horas} horas</td>
                    <td class="td-acciones">
                        <button type="button" class="btn-accion btn-editar" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button type="button" class="btn-accion btn-eliminar" title="Eliminar" onclick="removerMateria(${indice})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                    </td>
                `;
                tablaCuerpo.appendChild(nuevaFila);
            });
        }

        actualizarEstadisticas();
    };

    // Funciones del Modal
    const abrirModal = () => {
        if (modalMateria) modalMateria.style.display = 'flex';
    };

    const cerrarModal = () => {
        if (modalMateria) modalMateria.style.display = 'none';
        if (formMateria) formMateria.reset();
    };

    if (btnNuevaMateria) btnNuevaMateria.addEventListener('click', abrirModal);
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
    if (btnCancelar) btnCancelar.addEventListener('click', cerrarModal);

    window.addEventListener('click', (e) => {
        if (e.target === modalMateria) cerrarModal();
    });

    // Guardar nueva materia
    if (formMateria) {
        formMateria.addEventListener('submit', (e) => {
            e.preventDefault();

            const nuevaMateria = {
                id: Date.now().toString(),
                nombre: document.getElementById('nombre-materia').value,
                profesor: document.getElementById('profesor-materia').value,
                nivel: document.getElementById('nivel-materia').value,
                paralelo: document.getElementById('paralelo-materia').value,
                horas: document.getElementById('horas-materia').value
            };

            coleccionMaterias.push(nuevaMateria);
            actualizarAlmacenamientoLocal();
            redibujarInterfaz();

            cerrarModal();
            mostrarToast('Materia guardada exitosamente');
        });
    }

    // Eliminar materia
    window.removerMateria = function (indice) {
        coleccionMaterias.splice(indice, 1);
        actualizarAlmacenamientoLocal();
        redibujarInterfaz();
        mostrarToast('Materia eliminada correctamente');
    };

    // Render inicial
    redibujarInterfaz();
});