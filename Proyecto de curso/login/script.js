// Espera a que el usuario intente enviar el formulario
document.getElementById('registroForm').addEventListener('submit', function (e) {
    // Evita que la página se recargue automáticamente
    e.preventDefault();

    // Limpia los mensajes de error y los bordes rojos
    limpiarErrores();

    let esValido = true;

    // Obtener los valores ingresados quitando espacios al inicio y al final (.trim())
    const correo = document.getElementById('cedula-correo').value.trim();
    const password = document.getElementById('password').value.trim();

    // Comprueba que el correo no esté vacío (campo obligatorio) y tenga formato válido
    if (correo === '') {
        mostrarError('cedula-correo', 'errorNombre', 'El correo electrónico es obligatorio');
        esValido = false;
    } else if (!correo.includes('@') || !correo.includes('.')) {
        // Verifica que incluya '@' y un punto '.'
        mostrarError('cedula-correo', 'errorNombre', 'Ingrese un correo válido (ejemplo@dominio.com)');
        esValido = false;
    }

    // Comprueba que el campo contraseña no esté vacío (campo obligatorio)
    if (password === '') {
        mostrarError('password', 'errorPass', 'La contraseña es obligatoria');
        esValido = false;
    } else if (password.length < 6) {
        mostrarError('password', 'errorPass', 'La contraseña debe tener al menos 6 caracteres');
        esValido = false;
    }

    // Si todas las validaciones pasaron correctamente
    if (esValido) {
        // Redirección según rol en correo institucional
        if (correo.includes('admin')) {
            localStorage.setItem('usuarioSesion', JSON.stringify({
                nombre: 'Michael Pilligua',
                correo: correo,
                rol: 'Administrador',
                iniciales: 'MP'
            }));
            window.location.href = '../administracion/dashboard-admin/index.html';
        } else if (correo.includes('docente')) {
            window.location.href = '../academico/horario-docente/index.html';
        } else if (correo.includes('estudiante')) {
            window.location.href = '../academico/horario-estudiante/index.html';
        } else {
            alert('Usuario no reconocido. Por favor, ingrese un correo institucional válido.');
        }
        console.log('Inicio de sesión exitoso!');
    }
});

// Función auxiliar para marcar el cuadro en rojo y mostrar el mensaje de error
function mostrarError(inputId, spanId, mensaje) {
    document.getElementById(inputId).classList.add('input-error');
    document.getElementById(spanId).innerText = mensaje;
}

// Función para reiniciar los estilos y borrar los mensajes de error previos
function limpiarErrores() {
    const inputs = document.querySelectorAll('input');
    const errores = document.querySelectorAll('.error');

    // Quita el borde rojo de todos los campos de texto
    inputs.forEach(input => input.classList.remove('input-error'));
    // Borra el texto de los span de error
    errores.forEach(span => span.innerText = '');
}
