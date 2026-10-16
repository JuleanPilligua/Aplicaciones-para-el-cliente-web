// Espera a que el usuario intente enviar el formulario
document.getElementById('registroForm').addEventListener('submit', function (e) {
    // Evita que la página se recargue automáticamente
    e.preventDefault();

    // Limpia los mensajes de error y los bordes rojos
    limpiarErrores();

    let esValido = true;

    // Obtener el valor ingresado en el campo de cédula o correo
    const cedulaCorreo = document.getElementById('cedula-correo').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validación para el campo "Cédula o correo electrónico"
    if (cedulaCorreo === '') {
        mostrarError('cedula-correo', 'errorNombre', 'Este campo no puede estar vacío');
        esValido = false;
    } else {
        // Verificamos si ingresó una cédula (10 números) o un correo válido
        const esCedulaValida = !isNaN(cedulaCorreo) && cedulaCorreo.length === 10;
        const esCorreoValido = cedulaCorreo.includes('@') && cedulaCorreo.includes('.');

        if (!esCedulaValida && !esCorreoValido) {
            mostrarError('cedula-correo', 'errorNombre', 'Ingrese una cédula válida (10 dígitos) o un correo institucional');
            esValido = false;
        }
    }

    // Validación para la contraseña (puedes ajustar el largo mínimo si lo deseas)
    if (password === '') {
        mostrarError('password', 'errorPass', 'La contraseña es obligatoria');
        esValido = false;
    } else if (password.length < 6) {
        mostrarError('password', 'errorPass', 'La contraseña debe tener al menos 6 caracteres');
        esValido = false;
    }

    // Si todas las validaciones pasaron correctamente
    if (esValido) {
        // Aquí puedes redirigir o procesar el login exitoso
        if (cedulaCorreo.includes('admin')) { // Validación para el correo de administrador
            window.location.href = '../dashboard-admin/index.html';
        } else if (cedulaCorreo.includes('docente')) { // Validación para el correo de docente
            window.location.href = '../horario-docente/index.html';
        } else if (cedulaCorreo.includes('estudiante')) { // Validación para el correo de estudiante
            window.location.href = '../horario-estudiante/index.html';
        } else {
            alert('Usuario no reconocido. Por favor, ingrese un correo institucional válido.');
        }
        console.log('Inicio de sesión exitoso!');
    }
})

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