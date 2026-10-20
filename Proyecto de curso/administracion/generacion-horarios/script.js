document.addEventListener('DOMContentLoaded', () => {
    const btnGenerarAuto = document.getElementById('btn-generar-auto');
    const modalGenerarHorario = document.getElementById('modal-generar-horario');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnCancelarModal = document.getElementById('btn-cancelar-modal');

    // Abrir Modal de Confirmación
    if (btnGenerarAuto) {
        btnGenerarAuto.addEventListener('click', () => {
            if (modalGenerarHorario) modalGenerarHorario.style.display = 'flex';
        });
    }

    // Cerrar Modal
    const cerrarModal = () => {
        if (modalGenerarHorario) modalGenerarHorario.style.display = 'none';
    };

    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
    if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModal);

    if (modalGenerarHorario) {
        modalGenerarHorario.addEventListener('click', (e) => {
            if (e.target === modalGenerarHorario) cerrarModal();
        });
    }
});