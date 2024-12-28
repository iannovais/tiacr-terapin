document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('.input input');

    inputs.forEach(input => {
        if (input.value) {
            input.classList.add('tem-texto');
        }

        input.addEventListener('input', function () {
            if (this.value) {
                this.classList.add('tem-texto');
            } else {
                this.classList.remove('tem-texto');
            }
        });
    });

    $('#cad-convenio').on('reset', function () {
        inputs.forEach(input => {
            input.classList.remove('tem-texto');
        });
    });
});
