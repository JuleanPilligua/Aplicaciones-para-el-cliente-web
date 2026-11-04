const formulario = document.getElementById('formulario');
const tabla = document.getElementById('listaEstudiantes');

// Lee de LocalStorage usando JSON.parse()
function obtenerEstudiantes() {
    const datos = localStorage.getItem('estudiantes');
    return datos ? JSON.parse(datos) : [];
}

// Guarda en LocalStorage usando JSON.stringify()
function guardarEnLocalStorage(estudiantes) {
    localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
}

// MOSTRAR EN TABLA
function mostrarEstudiantes() {
    const estudiantes = obtenerEstudiantes();
    tabla.innerHTML = '';

    estudiantes.forEach((est, index) => {
        tabla.innerHTML += `
            <tr>
                <td>${est.cedula}</td>
                <td>${est.apellidos}</td>
                <td>${est.nombres}</td>
                <td>${est.direccion}</td>
                <td>${est.telefono}</td>
                <td>${est.correo}</td>
                <td>${est.facultad}</td>
                <td>${est.nivel}</td>
                <td>${est.paralelo}</td>
                <td><button class="btn-eliminar" onclick="eliminarEstudiante(${index})">X</button></td>
            </tr>
        `;
    });
}

// VALIDACIONES CON EXPRESIONES REGULARES (RegEx)
function validarDatos(estudiante) {
    const regexCedula = /^\d{10}$/;                            // 10 números
    const regexTexto = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;            // Solo letras y espacios
    const regexTelefono = /^09\d{8}$/;                         // 10 dígitos iniciando en 09
    const regexCorreo = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;     // Formato correo
    const regexNivel = /^(10|[1-9])$/;                         // 1 al 10
    const regexParalelo = /^[a-zA-Z]$/;                        // 1 letra

    if (!regexCedula.test(estudiante.cedula)) {
        alert('Cédula inválida: debe tener exactamente 10 dígitos.');
        return false;
    }
    if (!regexTexto.test(estudiante.apellidos) || !regexTexto.test(estudiante.nombres)) {
        alert('Apellidos y Nombres solo deben contener letras.');
        return false;
    }
    if (estudiante.direccion.trim().length < 5) {
        alert('Dirección inválida: debe tener al menos 5 caracteres.');
        return false;
    }
    if (!regexTelefono.test(estudiante.telefono)) {
        alert('Teléfono inválido: debe tener 10 dígitos e iniciar con 09.');
        return false;
    }
    if (!regexCorreo.test(estudiante.correo)) {
        alert('Correo electrónico inválido.');
        return false;
    }
    if (!regexTexto.test(estudiante.facultad)) {
        alert('Facultad inválida: solo letras.');
        return false;
    }
    if (!regexNivel.test(estudiante.nivel)) {
        alert('Nivel inválido: debe ser un número del 1 al 10.');
        return false;
    }
    if (!regexParalelo.test(estudiante.paralelo)) {
        alert('Paralelo inválido: debe ser una sola letra.');
        return false;
    }

    return true;
}

// EVENTO SUBMIT (AGREGAR ESTUDIANTE)
formulario.addEventListener('submit', function (e) {
    e.preventDefault();

    const nuevoEstudiante = {
        cedula: document.getElementById('cedula').value.trim(),
        apellidos: document.getElementById('apellidos').value.trim(),
        nombres: document.getElementById('nombres').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        facultad: document.getElementById('facultad').value.trim(),
        nivel: document.getElementById('nivel').value.trim(),
        paralelo: document.getElementById('paralelo').value.trim().toUpperCase()
    };

    // Validar con expresiones regulares
    if (!validarDatos(nuevoEstudiante)) return;

    // Recuperar con JSON.parse(), agregar y guardar con JSON.stringify()
    const estudiantes = obtenerEstudiantes();
    estudiantes.push(nuevoEstudiante);
    guardarEnLocalStorage(estudiantes);

    formulario.reset();
    mostrarEstudiantes();
    alert('¡Estudiante guardado en LocalStorage correctamente!');
});

// ELIMINAR ESTUDIANTE
window.eliminarEstudiante = function (index) {
    const estudiantes = obtenerEstudiantes();
    estudiantes.splice(index, 1);
    guardarEnLocalStorage(estudiantes);
    mostrarEstudiantes();
};

// CARGAR DATOS AL INICIAR
mostrarEstudiantes();
