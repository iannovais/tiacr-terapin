$(document).ready(function () {
    var pagamentoId = getPagamentoIdFromUrl();

    if (pagamentoId) {
        console.log('Carregando pagamento com ID:', pagamentoId);

        $.ajax({
            type: 'GET',
            url: '/api/pagamento/' + pagamentoId,
            success: function (response) {
                console.log('Dados do pagamento recebidos:', response);
            
                if (response) {
                    $('#nome_pagamento').text(response.nome_paciente || 'Nome não disponível');
                    $('#data_pagamento').text(formatarData(response.data_pagamento)); 
                    $('#valor_pagamento').text('R$ ' + response.valor.toFixed(2).replace('.', ','));
                    $('#data_consulta').text(formatarData(response.data_consulta)); 
            
                    $('#input-metodo').val(response.metodo);
                    $('#input-data-pagamento').val(formatarDataEditar(response.data_pagamento)); 
                    $('#input-parcelas').val(response.parcelas + 'x');

                } else {
                    console.error('Nenhum dado retornado para o pagamento.');
                }
            },                                
            error: function (xhr, status, error) {
                console.error('Erro ao buscar dados do pagamento:', error);
            }
        });
    } else {
        console.error('Nenhum ID de pagamento foi encontrado na URL.');
    }

    $('#editar-pagamento').submit(function (e) {
        e.preventDefault();

        var formData = {
            metodo: $('#input-metodo').val(),
            data_pagamento: $('#input-data-pagamento').val(),
            parcelas: $('#input-parcelas').val().replace('x', ''),
            valor: parseFloat($('#valor_pagamento').text().replace('R$', '')) 
        };

        $.ajax({
            type: 'PUT',
            url: '/api/pagamento/' + pagamentoId,
            data: JSON.stringify(formData),
            contentType: 'application/json',
            processData: false,
            success: function (response) {
                Toastify({
                    text: "Pagamento atualizado com sucesso!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#4CAF50",
                    close: true,
                }).showToast();
            },
            error: function (xhr, status, error) {
                Toastify({
                    text: "Erro ao atualizar o pagamento!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#f44336",
                    close: true,
                }).showToast();
            }
        });
    });

    function getPagamentoIdFromUrl() {
        const hash = window.location.hash;
        return hash ? hash.substring(1) : null; 
    }    

    function formatarDataEditar(dataISO) {
        if (!dataISO) return ''; 
        const data = new Date(dataISO); 
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0'); 
        return `${ano}-${mes}-${dia}`; 
    }    

    function formatarData(dataISO) {
        if (!dataISO) return ''; 
        const data = new Date(dataISO); 
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0'); 
        return `${dia}/${mes}/${ano}`; 
    }
});
