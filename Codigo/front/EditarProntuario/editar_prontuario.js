$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const consultaId = urlParams.get('id');

    $.ajax({
        url: `/api/prontuario/${consultaId}`,
        method: 'GET',
        contentType: 'application/json',
        success: function (response) {
            $('#input-historico-pessoal').val(response.historico_pessoal);
            $('#input-exame-psiquico').val(response.exame_psiquico);
        },
        error: function (error) {
            console.error('Erro ao carregar prontuário:', error);

            Toastify({
                text: "Erro ao carregar prontuário!",
                duration: 3000,
                close: true,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#FF0000"
            }).showToast();
        }
    });

    $('#editar-prontuario').submit(function (e) {
        e.preventDefault();

        var formData = {
            historico_pessoal: $('#input-historico-pessoal').val(),
            exame_psiquico: $('#input-exame-psiquico').val()
        };

        $.ajax({
            url: `/api/prontuario/${consultaId}`,
            method: 'PUT', 
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                Toastify({
                    text: "Prontuário atualizado com sucesso!",
                    duration: 3000,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#4CAF50"
                }).showToast();
            },
            error: function (error) {
                console.error('Erro ao atualizar prontuário:', error);

                let errorMessage = error.responseJSON?.error || "Erro ao atualizar prontuário!";

                Toastify({
                    text: errorMessage,
                    duration: 3000,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#FF0000"
                }).showToast();
            }
        });
    });
});
