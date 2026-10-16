// Espera a que el usuario intente enviar el formulario
document.getElementById('formulario').addEventListener('submit', function (e) {
  // Evita que la página se recargue automáticamente
  e.preventDefault();

  // Limpia los mensajes de error y los bordes rojos
  limpiarErrores();


  let esValido = true;

  // Obtener los valores ingresados quitando espacios al inicio y al final (.trim())
  const cedula = document.getElementById('cedula').value.trim();
  const nombre = document.getElementById('nombre').value.trim();
  const direccion = document.getElementById('direccion').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const correo = document.getElementById('correo').value.trim();

  // isNaN verifica si no es número, y .length comprueba que tenga exactamente 10 caracteres
  if (isNaN(cedula) || cedula.length !== 10 || cedula === '') {
    mostrarError('cedula', 'errCedula', 'Debe ingresar exactamente 10 números');
    esValido = false;
  }

  // Comprueba que el campo no esté vacío
  if (nombre === '') {
    mostrarError('nombre', 'errNombre', 'El nombre es obligatorio');
    esValido = false;
  }

  // Comprueba que el campo no esté vacío
  if (direccion === '') {
    mostrarError('direccion', 'errDireccion', 'La dirección es obligatoria');
    esValido = false;
  }

  // Verifica que sean solo números y tenga exactamente 10 dígitos
  if (isNaN(telefono) || telefono.length !== 10 || telefono === '') {
    mostrarError('telefono', 'errTelefono', 'Debe ingresar exactamente 10 números');
    esValido = false;
  }


  // Verifica que incluiya '@' y un punto '.', además de no estar vacío
  if (!correo.includes('@') || !correo.includes('.') || correo === '') {
    mostrarError('correo', 'errCorreo', 'Ingrese un correo válido (ejemplo@dominio.com)');
    esValido = false;
  }

  // Si todas las validaciones pasaron correctamente
  if (esValido) {
    document.getElementById('msgExito').innerText = '¡Cliente registrado con éxito!';
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
  // Borra el mensaje de éxito
  document.getElementById('msgExito').innerText = '';
}