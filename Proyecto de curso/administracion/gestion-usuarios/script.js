document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener referencias a los elementos del DOM
    const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');
    const modalOverlay = document.getElementById('modal-overlay');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnCancelar = document.getElementById('btn-cancelar');
    const formularioUsuario = document.getElementById('formulario-usuario');

    // 2. Función para abrir la modal
    const abrirModal = () => {
        modalOverlay.style.display = 'flex';
    };

    // 3. Función para cerrar la modal y limpiar el formulario
    const cerrarModal = () => {
        modalOverlay.style.display = 'none';
        if (formularioUsuario) {
            formularioUsuario.reset(); // Limpia los campos del formulario
        }
    };

    // 4. Evento para abrir la modal al hacer clic en "Nuevo Usuario"
    if (btnNuevoUsuario) {
        btnNuevoUsuario.addEventListener('click', abrirModal);
    }

    // 5. Eventos para cerrar la modal (Botón 'X' y Botón 'Cancelar')
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', cerrarModal);
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', cerrarModal);
    }

    // 6. Cerrar modal al hacer clic fuera del contenedor blanco (en el overlay oscuro)
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                cerrarModal();
            }
        });
    }
});