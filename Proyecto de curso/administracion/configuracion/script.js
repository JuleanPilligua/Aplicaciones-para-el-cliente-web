document.addEventListener('DOMContentLoaded', () => {

    // 1. REFERENCIAS AL DOM
    const inputNiveles = document.getElementById('input-niveles');
    const btnGuardarNiveles = document.getElementById('btn-guardar-niveles');

    const contenedorParalelos = document.getElementById('contenedor-paralelos');
    const inputNuevoParalelo = document.getElementById('input-nuevo-paralelo');
    const btnAgregarParalelo = document.getElementById('btn-agregar-paralelo');

    const selectHoraInicio = document.getElementById('select-hora-inicio');
    const selectHoraFin = document.getElementById('select-hora-fin');
    const selectDuracionBloque = document.getElementById('select-duracion-bloque');
    const contenedorBloques = document.getElementById('contenedor-bloques');
    const contadorBloques = document.getElementById('contador-bloques');
    const btnGuardarHorario = document.getElementById('btn-guardar-horario');

    const notificacionToast = document.getElementById('toast-notificacion');
    const toastMensaje = document.getElementById('toast-mensaje');
    const btnCerrarToast = document.getElementById('toast-cerrar');
    let timeoutToast = null;

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

    // 2. ESTADO DE LA APLICACIÓN 
    const configuracionPredeterminada = {
        cantidadNiveles: 10,
        paralelosActivos: ['A', 'B', 'C'],
        horario: {
            horaInicio: '07:00',
            horaFin: '18:00',
            duracionBloque: '60'
        }
    };

    let configuracionSistema = JSON.parse(localStorage.getItem('configuracionSistema')) || configuracionPredeterminada;

    const guardarEnLocalStorage = () => {
        localStorage.setItem('configuracionSistema', JSON.stringify(configuracionSistema));
    };

    // 3. SISTEMA DE NOTIFICACIONES TOAST
    const mostrarNotificacion = (mensaje) => {
        if (!notificacionToast) return;
        if (timeoutToast) clearTimeout(timeoutToast);

        if (toastMensaje) toastMensaje.textContent = mensaje;
        notificacionToast.style.display = 'flex';

        timeoutToast = setTimeout(() => {
            ocultarNotificacion();
        }, 3500);
    };

    const ocultarNotificacion = () => {
        if (notificacionToast) notificacionToast.style.display = 'none';
        if (timeoutToast) clearTimeout(timeoutToast);
    };

    if (btnCerrarToast) btnCerrarToast.addEventListener('click', ocultarNotificacion);

    // 4. LÓGICA DE NIVELES
    const cargarNiveles = () => {
        if (inputNiveles) inputNiveles.value = configuracionSistema.cantidadNiveles;
    };

    if (btnGuardarNiveles) {
        btnGuardarNiveles.addEventListener('click', () => {
            const valor = parseInt(inputNiveles.value, 10);
            if (valor && valor >= 1 && valor <= 20) {
                configuracionSistema.cantidadNiveles = valor;
                guardarEnLocalStorage();
                mostrarNotificacion('Cantidad de niveles guardada correctamente');
            } else {
                alert('Por favor ingresa un número de niveles válido (1 a 20).');
            }
        });
    }

    // 5. LÓGICA DE PARALELOS
    const renderizarParalelos = () => {
        if (!contenedorParalelos) return;
        contenedorParalelos.innerHTML = '';

        configuracionSistema.paralelosActivos.forEach((paralelo, indice) => {
            const badge = document.createElement('span');
            badge.className = 'badge-paralelo';
            badge.innerHTML = `
                ${paralelo}
                <button type="button" class="btn-remover-paralelo" aria-label="Remover paralelo ${paralelo}" onclick="removerParalelo(${indice})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            `;
            contenedorParalelos.appendChild(badge);
        });
    };

    const agregarParalelo = () => {
        const nuevaLetra = inputNuevoParalelo.value.trim().toUpperCase();

        // 1. Comprueba que el campo no esté vacío
        if (nuevaLetra === '') {
            mostrarNotificacion('Por favor ingresa una letra para el paralelo');
            return;
        }

        // 2. Validación con isNaN (Opción 2): si !isNaN, es un número
        if (!isNaN(nuevaLetra)) {
            mostrarNotificacion('No puedes ingresar números como paralelo');
            return;
        }

        // 3. Comprobar que no exista duplicado
        if (configuracionSistema.paralelosActivos.includes(nuevaLetra)) {
            mostrarNotificacion(`El paralelo "${nuevaLetra}" ya existe`);
            return;
        }

        configuracionSistema.paralelosActivos.push(nuevaLetra);
        guardarEnLocalStorage();
        renderizarParalelos();
        inputNuevoParalelo.value = '';
        mostrarNotificacion(`Paralelo "${nuevaLetra}" agregado correctamente`);
    };

    window.removerParalelo = (indice) => {
        const removido = configuracionSistema.paralelosActivos.splice(indice, 1);
        guardarEnLocalStorage();
        renderizarParalelos();
        mostrarNotificacion(`Paralelo "${removido[0]}" removido correctamente`);
    };

    if (btnAgregarParalelo) btnAgregarParalelo.addEventListener('click', agregarParalelo);

    if (inputNuevoParalelo) {
        // Al presionar Enter, intentar agregar el paralelo
        inputNuevoParalelo.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                agregarParalelo();
            }
        });

        // Convertir automáticamente lo escrito a mayúsculas
        inputNuevoParalelo.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    // 6. LÓGICA DE VISTA PREVIA Y BLOQUES DE HORARIO
    const cargarValoresHorario = () => {
        if (selectHoraInicio) selectHoraInicio.value = configuracionSistema.horario.horaInicio;
        if (selectHoraFin) selectHoraFin.value = configuracionSistema.horario.horaFin;
        if (selectDuracionBloque) selectDuracionBloque.value = configuracionSistema.horario.duracionBloque;
    };

    const generarBloquesHorario = () => {
        if (!contenedorBloques || !selectHoraInicio || !selectHoraFin || !selectDuracionBloque) return;

        const inicio = selectHoraInicio.value;
        const fin = selectHoraFin.value;
        const duracionMinutos = parseInt(selectDuracionBloque.value, 10);

        const [hInicio, mInicio] = inicio.split(':').map(Number);
        const [hFin, mFin] = fin.split(':').map(Number);

        let minutosActuales = hInicio * 60 + mInicio;
        const minutosFinales = hFin * 60 + mFin;

        const bloques = [];

        while (minutosActuales + duracionMinutos <= minutosFinales) {
            const horas = Math.floor(minutosActuales / 60);
            const minutos = minutosActuales % 60;
            const formatoHora = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;

            bloques.push(formatoHora);
            minutosActuales += duracionMinutos;
        }

        // Renderizar píldoras de vista previa
        contenedorBloques.innerHTML = '';
        bloques.forEach((hora) => {
            const pildora = document.createElement('span');
            pildora.className = 'pildora-hora';
            pildora.textContent = hora;
            contenedorBloques.appendChild(pildora);
        });

        if (contadorBloques) {
            contadorBloques.textContent = `${bloques.length} bloque${bloques.length !== 1 ? 's' : ''}`;
        }
    };

    // Recalcular vista previa dinámicamente cuando el usuario cambie un select
    if (selectHoraInicio) selectHoraInicio.addEventListener('change', generarBloquesHorario);
    if (selectHoraFin) selectHoraFin.addEventListener('change', generarBloquesHorario);
    if (selectDuracionBloque) selectDuracionBloque.addEventListener('change', generarBloquesHorario);

    if (btnGuardarHorario) {
        btnGuardarHorario.addEventListener('click', () => {
            const [hInicio] = selectHoraInicio.value.split(':').map(Number);
            const [hFin] = selectHoraFin.value.split(':').map(Number);

            if (hInicio >= hFin) {
                alert('La hora de inicio debe ser menor que la hora de fin.');
                return;
            }

            configuracionSistema.horario = {
                horaInicio: selectHoraInicio.value,
                horaFin: selectHoraFin.value,
                duracionBloque: selectDuracionBloque.value
            };

            guardarEnLocalStorage();
            mostrarNotificacion('Configuración de horario guardada correctamente');
        });
    }

    // 7. INICIALIZACIÓN
    cargarNiveles();
    renderizarParalelos();
    cargarValoresHorario();
    generarBloquesHorario();
});
