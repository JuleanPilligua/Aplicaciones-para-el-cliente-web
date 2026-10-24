document.addEventListener('DOMContentLoaded', () => {
    // 1. Mostrar fecha actual formateada
    const fechaActual = new Date();
    const opcionesFecha = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const fechaFormateada = fechaActual.toLocaleDateString('es-ES', opcionesFecha);
    const elemFecha = document.getElementById('fecha-actual');
    if (elemFecha) {
        elemFecha.innerText = fechaFormateada;
    }

    // 2. Cargar datos de usuario dinámico desde sesión / localStorage (Error 3)
    cargarUsuario();

    // 3. Cargar estadísticas dinámicas desde localStorage (Error 4)
    cargarEstadisticas();
});

// Función para obtener iniciales a partir de un nombre completo
function obtenerIniciales(nombre) {
    if (!nombre) return 'AZ';
    const partes = nombre.trim().split(' ').filter(Boolean);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
}

// Cargar usuario dinámico
function cargarUsuario() {
    let sesion = null;
    try {
        sesion = JSON.parse(localStorage.getItem('usuarioSesion'));
    } catch (e) {
        console.error('Error al parsear usuarioSesion:', e);
    }

    let usuarios = [];
    try {
        usuarios = JSON.parse(localStorage.getItem('usuariosGuardados')) || [];
    } catch (e) {
        console.error('Error al parsear usuariosGuardados:', e);
    }

    let nombre = 'Ana Zambrano';
    let rol = 'Administrador';
    let iniciales = 'AZ';

    if (sesion && sesion.nombre) {
        nombre = sesion.nombre;
        rol = sesion.rol || 'Administrador';
        iniciales = sesion.iniciales || obtenerIniciales(nombre);
    } else {
        const adminUsuario = usuarios.find(u => u.rol && u.rol.toLowerCase() === 'administrador');
        if (adminUsuario && adminUsuario.nombre) {
            nombre = adminUsuario.nombre;
            rol = 'Administrador';
            iniciales = adminUsuario.iniciales || obtenerIniciales(nombre);
        }
    }

    const elemNombre = document.getElementById('sidebar-nombre');
    const elemRol = document.getElementById('sidebar-rol');
    const elemAvatar = document.getElementById('sidebar-avatar');
    const elemSaludo = document.getElementById('saludo-admin');

    if (elemNombre) elemNombre.textContent = nombre;
    if (elemRol) elemRol.textContent = rol;
    if (elemAvatar) elemAvatar.textContent = iniciales;
    if (elemSaludo) elemSaludo.textContent = `Bienvenido, ${nombre.split(' ')[0]}`;
}

// Cargar estadísticas desde localStorage
function cargarEstadisticas() {
    // Colección de Usuarios
    let usuarios = [];
    try {
        usuarios = JSON.parse(localStorage.getItem('usuariosGuardados')) || [];
    } catch (e) {
        console.error('Error al leer usuariosGuardados:', e);
    }

    const totalProfesores = usuarios.filter(u => u.rol && u.rol.toLowerCase() === 'profesor').length;
    const totalEstudiantes = usuarios.filter(u => u.rol && u.rol.toLowerCase() === 'estudiante').length;

    const elemProfesores = document.getElementById('stat-profesores');
    const elemEstudiantes = document.getElementById('stat-estudiantes');
    if (elemProfesores) elemProfesores.textContent = totalProfesores;
    if (elemEstudiantes) elemEstudiantes.textContent = totalEstudiantes;

    // Colección de Materias
    let materias = [];
    try {
        materias = JSON.parse(localStorage.getItem('materiasGuardadas')) || [];
    } catch (e) {
        console.error('Error al leer materiasGuardadas:', e);
    }

    const elemMaterias = document.getElementById('stat-materias');
    if (elemMaterias) elemMaterias.textContent = materias.length;

    // Colección de Periodos
    let periodos = [];
    try {
        periodos = JSON.parse(localStorage.getItem('periodosGuardados'));
    } catch (e) {
        console.error('Error al leer periodosGuardados:', e);
    }

    // Si aún no se ha guardado en localStorage, usar el seed inicial por defecto
    if (!periodos || periodos.length === 0) {
        periodos = [
            { id: '1', nombre: '2026-1S', fechas: '06 abril — 28 agosto', activo: true },
            { id: '2', nombre: '2025-2S', fechas: '13 octubre 2025 — 19 febrero 2026', activo: false },
            { id: '3', nombre: '2025-1S', fechas: '07 abril — 28 agosto 2025', activo: false }
        ];
    }

    const periodoActivo = periodos.find(p => p.activo === true);

    const elemStatPeriodo = document.getElementById('stat-periodo');
    const elemPeriodoBadge = document.getElementById('periodo-badge');
    const elemPeriodoNombre = document.getElementById('periodo-nombre');
    const elemPeriodoFechas = document.getElementById('periodo-fechas');

    if (periodoActivo) {
        if (elemStatPeriodo) elemStatPeriodo.textContent = periodoActivo.nombre;
        if (elemPeriodoBadge) {
            elemPeriodoBadge.textContent = 'Activo';
            elemPeriodoBadge.className = 'badge-periodo-activo';
        }
        if (elemPeriodoNombre) elemPeriodoNombre.textContent = periodoActivo.nombre;
        if (elemPeriodoFechas) elemPeriodoFechas.textContent = periodoActivo.fechas;
    } else {
        if (elemStatPeriodo) elemStatPeriodo.textContent = '—';
        if (elemPeriodoBadge) {
            elemPeriodoBadge.textContent = 'Sin periodo';
            elemPeriodoBadge.className = 'badge-sin-periodo';
        }
        if (elemPeriodoNombre) elemPeriodoNombre.textContent = '—';
        if (elemPeriodoFechas) elemPeriodoFechas.textContent = 'No hay periodo activo configurado';
    }
}
