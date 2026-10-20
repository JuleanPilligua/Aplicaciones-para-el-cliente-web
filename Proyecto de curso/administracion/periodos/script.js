document.addEventListener('DOMContentLoaded', () => {

    // 1. REFERENCIAS AL DOM
    const btnNuevoPeriodo = document.getElementById('btn-nuevo-periodo');
    const modalOverlay = document.getElementById('modal-overlay');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnCancelarModal = document.getElementById('btn-cancelar');
    const formularioPeriodo = document.getElementById('formulario-periodo');
    const listaPeriodos = document.getElementById('lista-periodos');

    // Toast
    const toastNotificacion = document.getElementById('toast-notificacion');
    const toastMensaje = document.getElementById('toast-mensaje');
    let toastTimeout = null;

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

    // 2. ESTADO DE LA APLICACIÓN (LocalStorage)
    // Cargar periodos o inicializar con datos iniciales si está vacío
    let coleccionPeriodos = JSON.parse(localStorage.getItem('periodosGuardados')) || [
        { id: '1', nombre: '2026-1S', fechas: '06 abril — 28 agosto 2026', fechaInicio: '2026-04-06', fechaFin: '2026-08-28', activo: true },
        { id: '2', nombre: '2025-2S', fechas: '13 octubre 2025 — 19 febrero 2026', fechaInicio: '2025-10-13', fechaFin: '2026-02-19', activo: false },
        { id: '3', nombre: '2025-1S', fechas: '07 abril — 28 agosto 2025', fechaInicio: '2025-04-07', fechaFin: '2025-08-28', activo: false }
    ];

    // Función para guardar en LocalStorage
    const actualizarAlmacenamientoLocal = () => {
        localStorage.setItem('periodosGuardados', JSON.stringify(coleccionPeriodos));
    };

    // 3. TOAST DE NOTIFICACIÓN
    const mostrarToast = (mensaje = 'Operación realizada con éxito') => {
        if (!toastNotificacion) return;
        if (toastTimeout) clearTimeout(toastTimeout);

        if (toastMensaje) toastMensaje.textContent = mensaje;
        toastNotificacion.style.display = 'flex';

        toastTimeout = setTimeout(() => {
            toastNotificacion.style.display = 'none';
        }, 3500);
    };

    // 4. RENDERIZAR INTERFAZ
    const redibujarInterfaz = () => {
        listaPeriodos.innerHTML = '';

        if (coleccionPeriodos.length === 0) {
            listaPeriodos.innerHTML = `
                <div class="estado-vacio" style="text-align: center; padding: 40px; color: #6D7588;">
                    <p class="p-estado-vacio" style="font-weight: 600; font-size: 15px; color: #202435; margin: 0;">No hay periodos académicos registrados</p>
                    <p class="p-estado-vacio-sub" style="font-size: 13px; margin: 6px 0 0 0;">Haz clic en "+ Nuevo Periodo" para agregar uno.</p>
                </div>
            `;
        } else {
            coleccionPeriodos.forEach((periodo, indice) => {
                const tarjeta = document.createElement('div');
                tarjeta.className = `tarjeta-periodo ${periodo.activo ? 'tarjeta-periodo-activo' : ''}`;

                tarjeta.innerHTML = `
                    <div class="periodo-info">
                        <div class="periodo-nombre-badge">
                            <h3 class="nombre-periodo">${periodo.nombre}</h3>
                            ${periodo.activo 
                                ? '<span class="badge-activo">Activo</span>' 
                                : '<span class="badge-inactivo">Inactivo</span>'}
                        </div>
                        <p class="periodo-fechas">${periodo.fechas}</p>
                    </div>
                    <div class="periodo-acciones">
                        ${periodo.activo
                            ? `<button type="button" class="boton-desactivar" onclick="cambiarEstadoPeriodo(${indice})">Desactivar</button>`
                            : `<button type="button" class="boton-activar" onclick="cambiarEstadoPeriodo(${indice})">Activar</button>`
                        }
                        <button type="button" class="boton-eliminar" onclick="removerPeriodo(${indice})">Eliminar</button>
                    </div>
                `;

                listaPeriodos.appendChild(tarjeta);
            });
        }
    };

    // 5. FUNCIONES DE VALIDACIÓN 
    function mostrarError(inputId, spanId, mensaje) {
        const inputElem = document.getElementById(inputId);
        const spanElem = document.getElementById(spanId);
        if (inputElem) inputElem.classList.add('input-error');
        if (spanElem) spanElem.innerText = mensaje;
    }

    function limpiarErrores() {
        const inputs = formularioPeriodo ? formularioPeriodo.querySelectorAll('.input-campo') : [];
        const errores = formularioPeriodo ? formularioPeriodo.querySelectorAll('.error') : [];

        inputs.forEach(input => input.classList.remove('input-error'));
        errores.forEach(span => span.innerText = '');
    }

    // Formatear fechas a cadena legible en español (Ej. 06 abril — 28 agosto 2026)
    function formatearRangoFechas(fechaInicioStr, fechaFinStr) {
        const [y1, m1, d1] = fechaInicioStr.split('-');
        const [y2, m2, d2] = fechaFinStr.split('-');

        const fecha1 = new Date(parseInt(y1), parseInt(m1) - 1, parseInt(d1));
        const fecha2 = new Date(parseInt(y2), parseInt(m2) - 1, parseInt(d2));

        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];

        const dia1 = String(fecha1.getDate()).padStart(2, '0');
        const mes1 = meses[fecha1.getMonth()];

        const dia2 = String(fecha2.getDate()).padStart(2, '0');
        const mes2 = meses[fecha2.getMonth()];
        const anio2 = fecha2.getFullYear();

        return `${dia1} ${mes1} — ${dia2} ${mes2} ${anio2}`;
    }

    // 6. LÓGICA DEL MODAL
    const abrirModal = () => {
        limpiarErrores();
        if (modalOverlay) modalOverlay.style.display = 'flex';
    };

    const cerrarModal = () => {
        if (modalOverlay) modalOverlay.style.display = 'none';
        if (formularioPeriodo) formularioPeriodo.reset();
        limpiarErrores();
    };

    if (btnNuevoPeriodo) btnNuevoPeriodo.addEventListener('click', abrirModal);
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
    if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModal);

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) cerrarModal();
        });
    }

    // 7. CAPTURAR FORMULARIO Y GUARDAR CON VALIDACIÓN 
    if (formularioPeriodo) {
        formularioPeriodo.addEventListener('submit', (e) => {
            e.preventDefault();

            // Limpia los mensajes de error previos
            limpiarErrores();

            let esValido = true;

            const nombreVal = document.getElementById('nombre-periodo').value.trim();
            const fechaInicioVal = document.getElementById('fecha-inicio').value;
            const fechaFinVal = document.getElementById('fecha-fin').value;

            // 1. Validar nombre del periodo (según guia-de-js.js usando .includes)
            if (nombreVal === '') {
                mostrarError('nombre-periodo', 'errorNombrePeriodo', 'El nombre del periodo es obligatorio');
                esValido = false;
            } else if (!nombreVal.includes('-')) {
                mostrarError('nombre-periodo', 'errorNombrePeriodo', 'Usa el formato año-semestre (Ej. 2026-1S)');
                esValido = false;
            }

            // 2. Validar fecha de inicio
            if (!fechaInicioVal) {
                mostrarError('fecha-inicio', 'errorFechaInicio', 'Seleccione la fecha de inicio');
                esValido = false;
            }

            // 3. Validar fecha de fin
            if (!fechaFinVal) {
                mostrarError('fecha-fin', 'errorFechaFin', 'Seleccione la fecha de fin');
                esValido = false;
            }

            // 4. Validar coherencia del rango de fechas
            if (fechaInicioVal && fechaFinVal) {
                if (fechaInicioVal > fechaFinVal) {
                    mostrarError('fecha-fin', 'errorFechaFin', 'La fecha de fin debe ser posterior a la fecha de inicio');
                    esValido = false;
                }
            }

            // Si todas las validaciones pasaron correctamente
            if (esValido) {
                const fechasTextoFormateado = formatearRangoFechas(fechaInicioVal, fechaFinVal);

                const nuevoPeriodo = {
                    id: Date.now().toString(),
                    nombre: nombreVal.toUpperCase(),
                    fechas: fechasTextoFormateado,
                    fechaInicio: fechaInicioVal,
                    fechaFin: fechaFinVal,
                    activo: false // Se crea como inactivo por defecto
                };

                // Agregar al inicio del arreglo, guardar en LocalStorage y refrescar vista
                coleccionPeriodos.unshift(nuevoPeriodo);
                actualizarAlmacenamientoLocal();
                redibujarInterfaz();

                cerrarModal();
                mostrarToast('Periodo creado exitosamente');
            }
        });
    }

    // 8. FUNCIONES GLOBALES (Activar/Desactivar/Eliminar)
    // Cambiar estado activo/inactivo (Garantiza que solo un periodo sea activo)
    window.cambiarEstadoPeriodo = function (indice) {
        const estaActivo = coleccionPeriodos[indice].activo;

        // Desactivar todos los demás si vamos a activar uno nuevo
        if (!estaActivo) {
            coleccionPeriodos.forEach(p => p.activo = false);
            coleccionPeriodos[indice].activo = true;
            mostrarToast(`Periodo ${coleccionPeriodos[indice].nombre} activado`);
        } else {
            coleccionPeriodos[indice].activo = false;
            mostrarToast(`Periodo ${coleccionPeriodos[indice].nombre} desactivado`);
        }

        actualizarAlmacenamientoLocal();
        redibujarInterfaz();
    };

    // Eliminar periodo con confirmación
    window.removerPeriodo = function (indice) {
        const periodo = coleccionPeriodos[indice];
        const nombrePeriodo = periodo ? periodo.nombre : 'este periodo';

        if (confirm(`¿Estás seguro de que deseas eliminar el periodo académico ${nombrePeriodo}?`)) {
            coleccionPeriodos.splice(indice, 1);
            actualizarAlmacenamientoLocal();
            redibujarInterfaz();
            mostrarToast(`Periodo ${nombrePeriodo} eliminado correctamente`);
        }
    };

    // Renderizado inicial al cargar la página
    redibujarInterfaz();
});
