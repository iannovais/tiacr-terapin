$(document).ready(function () {
    $('#login-form').submit(function (e) {
        e.preventDefault();

        const formData = {
            email: $('#input-email').val(),
            senha: $('#input-password').val()
        };

        $.ajax({
            url: '/api/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('funcao', response.tipo);
                localStorage.setItem('profissionalId', response.id);
                window.location.href = `../Agenda/agenda.html`;
                Toastify({
                    text: "Login realizado com sucesso!",
                    duration: 3000,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#4BB543"
                }).showToast();
            },
            error: function (error) {
                console.error('Erro ao fazer login:', error);
                Toastify({
                    text: "Erro ao fazer login! Verifique suas credenciais.",
                    duration: 3000,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#FF0000"
                }).showToast();
            }
        });
    });
    document.getElementById('botao-cadastrar').addEventListener('click', function() {
        window.location.href = 'CadastrarUsuario/cadastrar_usuario.html';
    });
});
