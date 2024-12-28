$(document).ready(function() {
    $.ajax({
        url: '/api/convenio',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response && response.length > 0) {
                let $select = $('#input-convenio');
                response.forEach(function(convenio) {
                    $select.append(new Option(convenio.nome, convenio.id));
                });
            } else {
                console.log('Nenhum convênio encontrado.');
            }
        },
        error: function(error) {
            console.error('Erro ao buscar os convênios:', error);
        }
    });

    $('#cad-paciente').submit(function (e) {
        e.preventDefault();
        var formData = {

            nome_completo: $('#input-nome-completo').val(),
            data_nascimento: $('#input-data-nascimento').val(),
            email: $('#input-email').val(),
            telefone: $('#input-telefone').val(),
            outro_telefone: $('#input-outro-telefone').val(),
            rg: $('#input-rg').val(),
            sexo: $('#input-sexo').val(),
            estado_civil: $('#input-estado-civil').val(),
            cpf: $('#input-cpf').val(),
            cep: $('#input-cep').val(),
            endereco: $('#input-endereco').val(),
            numero: $('#input-numero').val(),
            bairro: $('#input-bairro').val(),
            cidade: $('#input-cidade').val(),
            convenio: $('#input-convenio').val(),
            plano: $('#input-plano').val(),
            numero_carteirinha: $('#input-numero-carteirinha').val(),
            validade: $('#input-validade').val() || null
        };

        $.ajax({
            url: '/api/paciente',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                window.location.href = `../VerPacientes/ver_paciente.html`;
                
                localStorage.setItem('toastMessage', 'Paciente cadastrado com sucesso!');
            },
            error: function(error) {
                console.error('Erro ao cadastrar paciente:', error);
                Toastify({
                    text: "Erro ao cadastrar paciente!",
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