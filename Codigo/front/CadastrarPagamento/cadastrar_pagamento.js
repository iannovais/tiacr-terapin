$(document).ready(function () {
    var consultaId = getConsultaIdFromUrl();

    if (consultaId) {
        $.ajax({
            type: 'GET',
            url: '/api/consulta/' + consultaId, 
            success: function (response) {
                $('#nome_pagamento').text(response.paciente_nome);
                $('#data_pagamento').text(formatarData(response.data));
                $('#valor_pagamento').text('R$ ' + response.valor.toFixed(2).replace('.', ','));
            },
            error: function (xhr, status, error) {
                console.error('Erro ao buscar dados da consulta:', error);
            }
        });
    }

    $('#cadastrar-pagamento').submit(function (e) {
        e.preventDefault();

        var formData = {
            metodo: $('#input-metodo').val(),
            data_pagamento: $('#input-data-pagamento').val(), 
            parcelas: $('#input-parcelas').val(),
            consulta_id: consultaId 
        };

        $.ajax({
            type: 'POST',
            url: '/api/pagamento',  
            data: JSON.stringify(formData),
            contentType: 'application/json',
            processData: false,
            success: function (response) {
                Toastify({
                    text: "Pagamento cadastrado com sucesso!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#4CAF50",
                    close: true,
                }).showToast();
            },
            error: function (xhr, status, error) {
                Toastify({
                    text: "Erro ao cadastrar o pagamento!",
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

function formatarData(dataISO) {
    const data = new Date(dataISO); 
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0'); 
    return `${dia}/${mes}/${ano}`; 
}

function getConsultaIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id'); 
}