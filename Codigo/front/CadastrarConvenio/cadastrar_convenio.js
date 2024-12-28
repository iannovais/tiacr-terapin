$(document).ready(function () {
    $('#cad-convenio').submit(function (e) {
        e.preventDefault();
        var formData = {
            nome: $('#input-nome').val(),
            ans: $('#input-ans').val(),
            limite_retorno: $('#input-limite-retorno').val() || "30"
        };

        $.ajax({
            type: 'POST',
            url: '/api/convenio',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            processData: false,
            success: function (response) {
                Toastify({
                    text: "Convênio cadastrado com sucesso!",
                    duration: 3000, 
                    gravity: "bottom", 
                    position: "right", 
                    backgroundColor: "#4CAF50", 
                    close: true,
                }).showToast();

                $('#cad-convenio')[0].reset();
            },
            error: function (xhr, status, error) {
                Toastify({
                    text: "Erro ao cadastrar o convênio!",
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