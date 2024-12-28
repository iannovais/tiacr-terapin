$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const consultaId = urlParams.get('id');

    $('#cad-prontuario').submit(function (e) {
        e.preventDefault();

        var formData = {
            consulta_id: consultaId,
            historico_pessoal: $('#input-historico-pessoal').val(),
            exame_psiquico: $('#input-exame-psiquico').val()
        };

        $.ajax({
            url: '/api/prontuario',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                window.location.href = `../VerConsultas/ver_consulta.html`;
                
                localStorage.setItem('toastMessage', 'Prontuário cadastrado com sucesso!');
            },
            error: function(error) {
                let errorMessage = error.responseJSON?.error || "Erro ao cadastrar prontuário!";
                
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