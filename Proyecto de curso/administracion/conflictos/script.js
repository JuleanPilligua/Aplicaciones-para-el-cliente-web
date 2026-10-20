document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. REFERENCIAS AL DOM
    // ==========================================
    const badgeTotalConflictos = document.getElementById('badge-total-conflictos');
    const statProfesores = document.getElementById('stat-profesores');
    const statAulas = document.getElementById('stat-aulas');
    const statParalelos = document.getElementById('stat-paralelos');

    const tabTodos = document.getElementById('tab-todos');
    const tabAlta = document.getElementById('tab-alta');
    const tabMedia = document.getElementById('tab-media');
    const btnReintentar = document.getElementById('btn-reintentar-validacion');

    const contenedorConflictos = document.getElementById('contenedor-conflictos');

    const modalResolver = document.getElementById('modal-resolver-conflicto');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnCancelarModal = document.getElementById('btn-cancelar-modal');
    const btnAplicarSolucion = document.getElementById('btn-aplicar-solucion');
    const modalDescripcion = document.getElementById('modal-conflicto-descripcion');

    let filtroActual = 'todos';
    let conflictoSeleccionadoIndice = null;

    // ==========================================
    // 2. LEER CONFLICTOS DE LOCALSTORAGE
    // ==========================================
    // Cargar los conflictos guardados desde la generación de horarios o inicializar vacío
    let listaConflictos = JSON.parse(localStorage.getItem('conflictosDetectados')) || [];

    const guardarConflictosEnLocalStorage = () => {
        localStorage.setItem('conflictosDetectados', JSON.stringify(listaConflictos));
    };

    // ==========================================
    // 3. CALCULAR ESTADÍSTICAS Y CONTADORES
    // ==========================================
    const actualizarEstadisticas = () => {
        const total = listaConflictos.length;
        const altas = listaConflictos.filter(c => c.prioridad === 'alta').length;
        const medias = listaConflictos.filter(c => c.prioridad === 'media').length;

        // Actualizar header badge
        if (badgeTotalConflictos) {
            badgeTotalConflictos.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"/></svg>
                ${total} conflicto${total !== 1 ? 's' : ''} detectado${total !== 1 ? 's' : ''}
            `;
        }

        // Contador de tipo de entidad afectada
        const profCount = listaConflictos.filter(c => c.tipo === 'Profesor').length;
        const aulaCount = listaConflictos.filter(c => c.tipo === 'Aula').length;
        const paralCount = listaConflictos.filter(c => c.tipo === 'Paralelo').length;

        if (statProfesores) statProfesores.textContent = profCount;
        if (statAulas) statAulas.textContent = aulaCount;
        if (statParalelos) statParalelos.textContent = paralCount;

        // Actualizar pestañas
        if (tabTodos) tabTodos.textContent = `Todos (${total})`;
        if (tabAlta) tabAlta.textContent = `Alto (${altas})`;
        if (tabMedia) tabMedia.textContent = `Medio (${medias})`;
    };

    // ==========================================
    // 4. RENDERIZAR LISTA DE CONFLICTOS
    // ==========================================
    const redibujarInterfaz = () => {
        actualizarEstadisticas();
        contenedorConflictos.innerHTML = '';

        let conflictosFiltrados = listaConflictos;
        if (filtroActual === 'alta') {
            conflictosFiltrados = listaConflictos.filter(c => c.prioridad === 'alta');
        } else if (filtroActual === 'media') {
            conflictosFiltrados = listaConflictos.filter(c => c.prioridad === 'media');
        }

        if (conflictosFiltrados.length === 0) {
            contenedorConflictos.innerHTML = `
                <div class="estado-vacio" style="text-align: center; padding: 40px; background: #ffffff; border-radius: 8px; border: 1px dashed #cbd5e1;">
                    <p style="font-size: 1.1rem; font-weight: 600; color: #1e293b; margin-bottom: 6px;">¡Sin conflictos detectados!</p>
                    <p style="font-size: 0.9rem; color: #64748b;">No existen incompatibilidades registradas en la generación de horarios actual.</p>
                </div>
            `;
            return;
        }

        conflictosFiltrados.forEach((conflicto, indiceOriginal) => {
            const indiceReal = listaConflictos.indexOf(conflicto);
            const tarjeta = document.createElement('article');
            tarjeta.className = `tarjeta-conflicto prioridad-${conflicto.prioridad}`;

            const badgeSeveridad = conflicto.prioridad === 'alta'
                ? '<span class="badge-severidad severidad-alta">Alto</span>'
                : '<span class="badge-severidad severidad-media">Medio</span>';

            tarjeta.innerHTML = `
                <div class="contenido-conflicto">
                    <div class="cabecera-conflicto">
                        <h2 class="titulo-conflicto">Conflicto de ${conflicto.tipo}</h2>
                        ${badgeSeveridad}
                    </div>
                    <p class="descripcion-conflicto">
                        ${conflicto.descripcion}
                    </p>
                    <div class="metadatos-conflicto">
                        <span class="meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            Prioridad: ${conflicto.prioridad}
                        </span>
                        <span class="meta-separador">·</span>
                        <span class="meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            ${conflicto.tiempo || 'Detectado recientemente'}
                        </span>
                    </div>
                </div>
                <div class="accion-conflicto">
                    <button class="boton-resolver" onclick="abrirModalResolver(${indiceReal})">Resolver</button>
                </div>
            `;

            contenedorConflictos.appendChild(tarjeta);
        });
    };

    // ==========================================
    // 5. CAMBIO DE PESTAÑAS (FILTROS)
    // ==========================================
    const botonesPestanas = document.querySelectorAll('.pestana-filtro');
    botonesPestanas.forEach(btn => {
        btn.addEventListener('click', (e) => {
            botonesPestanas.forEach(b => b.classList.remove('activo'));
            e.currentTarget.classList.add('activo');
            filtroActual = e.currentTarget.dataset.filtro;
            redibujarInterfaz();
        });
    });

    if (btnReintentar) {
        btnReintentar.addEventListener('click', () => {
            redibujarInterfaz();
        });
    }

    // ==========================================
    // 6. LÓGICA DE MODAL DE RESOLUCIÓN
    // ==========================================
    window.abrirModalResolver = function (indice) {
        conflictoSeleccionadoIndice = indice;
        const conflicto = listaConflictos[indice];

        if (modalDescripcion && conflicto) {
            modalDescripcion.textContent = `Conflicto: "${conflicto.descripcion}". Selecciona una alternativa para solucionar la superposición:`;
        }

        if (modalResolver) modalResolver.style.display = 'flex';
    };

    const cerrarModal = () => {
        if (modalResolver) modalResolver.style.display = 'none';
        conflictoSeleccionadoIndice = null;
    };

    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
    if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModal);

    if (modalResolver) {
        modalResolver.addEventListener('click', (e) => {
            if (e.target === modalResolver) cerrarModal();
        });
    }

    if (btnAplicarSolucion) {
        btnAplicarSolucion.addEventListener('click', () => {
            if (conflictoSeleccionadoIndice !== null) {
                // Eliminar el conflicto resuelto de la lista
                listaConflictos.splice(conflictoSeleccionadoIndice, 1);
                guardarConflictosEnLocalStorage();
                redibujarInterfaz();
                cerrarModal();
            }
        });
    }

    // Renderizado inicial al cargar la página
    redibujarInterfaz();
});