$(document).ready(function () {
    const id = window.location.hash.substring(1); 
    const inputs = document.querySelectorAll('.input input');

    if (id) {
        $.ajax({
            type: 'GET',
            url: `/api/convenio/${id}`,
            dataType: 'json',
            success: function (convenio) {
                $('#input-nome').val(convenio.nome);
                $('#input-ans').val(convenio.ans);
                $('#input-limite-retorno').val(convenio.limite_retorno);

                inputs.forEach(input => {
                    if (input.value) {
                        input.classList.add('tem-texto');
                    }
                });
            },
            error: function (xhr, status, error) {
                Toastify({
                    text: "Erro ao carregar os dados do convênio!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#f44336",
                    close: true,
                }).showToast();
            }
        });
    }

    $('#edit-convenio').submit(function (e) {
        e.preventDefault();
        var formData = {
            nome: $('#input-nome').val(),
            ans: $('#input-ans').val(),
            limite_retorno: $('#input-limite-retorno').val()
        };

        $.ajax({
            type: 'PUT',
            url: `/api/convenio/${id}`,
            data: JSON.stringify(formData),
            contentType: 'application/json',
            processData: false,
            success: function (response) {
                Toastify({
                    text: "Convênio editado com sucesso!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#4CAF50",
                    close: true,
                }).showToast();

                $('#cad-convenio')[0].reset();
                inputs.forEach(input => input.classList.remove('tem-texto'));
            },
            error: function (xhr, status, error) {
                Toastify({
                    text: "Erro ao editar o convênio!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#f44336",
                    close: true,
                }).showToast();
            }
        });
    });
});
