document.addEventListener('DOMContentLoaded', () => {
    const btnNuevaMateria = document.querySelector('.btn-nueva-materia');
    const modalNuevaMateria = document.getElementById('modal-nueva-materia');
    const btnCerrarModal = document.querySelector('.btn-cerrar-modal');
    const btnCancelar = document.querySelector('.btn-cancelar');

    if (btnNuevaMateria && modalNuevaMateria) {
        btnNuevaMateria.addEventListener('click', () => {
            modalNuevaMateria.style.display = 'flex';
        });
    }

    const cerrarModal = () => {
        if (modalNuevaMateria) {
            modalNuevaMateria.style.display = 'none';
        }
    };

    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', cerrarModal);
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', cerrarModal);
    }

    window.addEventListener('click', (event) => {
        if (event.target === modalNuevaMateria) {
            cerrarModal();
        }
    });
});