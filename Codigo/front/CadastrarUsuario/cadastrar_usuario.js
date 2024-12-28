$(document).ready(function() {

    $('#cad-usuario').submit(function(e) {
        e.preventDefault(); 
        const senha = $('#input-password').val();
        const confirmarSenha = $('#input-confirmar-senha').val();

        if (senha !== confirmarSenha) {
            Toastify({
                text: "As senhas não correspondem!",
                duration: 3000,
                close: true,
                gravity: "bottom", 
                position: "right", 
                backgroundColor: "#FF0000"
            }).showToast();
            return;
        }

        const formData = {
            nome: $('#input-nome-completo').val(),
            senha: senha,
            tipo: $('#input-role').val(),
            email: $('#input-email').val(),
            celular: $('#input-celular').val()
        };

        $.ajax({
            url: '/api/profissional',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                Toastify({
                    text: "Usuário cadastrado com sucesso!",
                    duration: 3000,
                    close: true,
                    gravity: "bottom", 
                    position: "right", 
                    backgroundColor: "#4BB543"
                }).showToast();
                $('#cad-usuario')[0].reset();
            },
            error: function(error) {
                console.error('Erro ao cadastrar usuário:', error);
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                }
                Toastify({
                    text: "Erro ao cadastrar usuário!",
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