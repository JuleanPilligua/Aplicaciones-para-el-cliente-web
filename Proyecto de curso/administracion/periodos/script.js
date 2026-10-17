document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. REFERENCIAS AL DOM
    // ==========================================
    const btnNuevoPeriodo = document.getElementById('btn-nuevo-periodo');
    const modalOverlay = document.getElementById('modal-overlay');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnCancelarModal = document.getElementById('btn-cancelar');
    const formularioPeriodo = document.getElementById('formulario-periodo');
    const listaPeriodos = document.getElementById('lista-periodos');

    // ==========================================
    // 2. ESTADO DE LA APLICACIÓN (LocalStorage)
    // ==========================================
    // Cargar periodos o inicializar con datos de prueba si está vacío
    let coleccionPeriodos = JSON.parse(localStorage.getItem('periodosGuardados')) || [
        { id: '1', nombre: '2026-1S', fechas: '06 abril — 28 agosto', activo: true },
        { id: '2', nombre: '2025-2S', fechas: '13 octubre 2025 — 19 febrero 2026', activo: false },
        { id: '3', nombre: '2025-1S', fechas: '07 abril — 28 agosto 2025', activo: false }
    ];

    // Función para guardar en LocalStorage
    const actualizarAlmacenamientoLocal = () => {
        localStorage.setItem('periodosGuardados', JSON.stringify(coleccionPeriodos));
    };

    // ==========================================
    // 3. RENDERIZAR INTERFAZ
    // ==========================================
    const redibujarInterfaz = () => {
        listaPeriodos.innerHTML = ''; // Vaciar contenedor antes de pintar

        if (coleccionPeriodos.length === 0) {
            listaPeriodos.innerHTML = `
                <div class="estado-vacio" style="text-align: center; padding: 40px;">
                    <p class="p-estado-vacio">No hay periodos académicos registrados</p>
                    <p class="p-estado-vacio-sub">Haz clic en "+ Nuevo Periodo" para agregar uno.</p>
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
                            ? `<button class="boton-desactivar" onclick="cambiarEstadoPeriodo(${indice})">Desactivar</button>`
                            : `<button class="boton-activar" onclick="cambiarEstadoPeriodo(${indice})">Activar</button>`
                        }
                        <button class="boton-eliminar" onclick="removerPeriodo(${indice})">Eliminar</button>
                    </div>
                `;

                listaPeriodos.appendChild(tarjeta);
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
        if (formularioPeriodo) formularioPeriodo.reset();
    };

    if (btnNuevoPeriodo) btnNuevoPeriodo.addEventListener('click', abrirModal);
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
    if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModal);

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) cerrarModal();
        });
    }

    // ==========================================
    // 5. CAPTURAR FORMULARIO Y GUARDAR
    // ==========================================
    if (formularioPeriodo) {
        formularioPeriodo.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombreVal = document.getElementById('nombre-periodo').value.trim();
            const fechasVal = document.getElementById('fechas-periodo').value.trim();

            const nuevoPeriodo = {
                id: Date.now().toString(),
                nombre: nombreVal,
                fechas: fechasVal || 'Fechas por definir',
                activo: false // Se crea como inactivo por defecto
            };

            // Agregar al arreglo, guardar en LocalStorage y refrescar vista
            coleccionPeriodos.unshift(nuevoPeriodo); // unshift coloca el nuevo periodo al inicio
            actualizarAlmacenamientoLocal();
            redibujarInterfaz();

            cerrarModal();
        });
    }

    // ==========================================
    // 6. FUNCIONES GLOBALES (Activar/Desactivar/Eliminar)
    // ==========================================
    // Cambiar estado activo/inactivo (Garantiza que solo un periodo sea activo)
    window.cambiarEstadoPeriodo = function (indice) {
        const estaActivo = coleccionPeriodos[indice].activo;

        // Desactivar todos los demás si vamos a activar uno nuevo
        if (!estaActivo) {
            coleccionPeriodos.forEach(p => p.activo = false);
            coleccionPeriodos[indice].activo = true;
        } else {
            coleccionPeriodos[indice].activo = false;
        }

        actualizarAlmacenamientoLocal();
        redibujarInterfaz();
    };

    // Eliminar periodo
    window.removerPeriodo = function (indice) {
        coleccionPeriodos.splice(indice, 1);
        actualizarAlmacenamientoLocal();
        redibujarInterfaz();
    };

    // Renderizado inicial al cargar la página
    redibujarInterfaz();
});