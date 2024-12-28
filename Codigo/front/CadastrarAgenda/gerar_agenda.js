$(document).ready(function () {
    const profissionalId = localStorage.getItem('profissionalId');

    $('#cad-agenda').submit(function (event) {
        event.preventDefault();

        let diasSelecionados = [];
        $('.dias-da-semana input[type="checkbox"]:checked').each(function () {
            diasSelecionados.push($(this).val());
        });

        const agendaData = {
            id_profissional: profissionalId,
            dias_semana: diasSelecionados,
            data_especifica: $('#input-data-especifica').val(),
            hora_inicio: $('#input-horario-inicio').val(),
            hora_fim: $('#input-horario-termino').val(),
            inicio_almoco: $('#input-horario-almoco-inicio').val(),
            final_almoco: $('#input-horario-almoco-termino').val(),
            ativo: true
        };

        $.ajax({
            type: 'GET',
            url: `/api/agenda/${profissionalId}`,
            success: function (response) {
                if (response && response.ativo) {
                    $.ajax({
                        type: 'DELETE',
                        url: `/api/agenda/${response.id}`,
                        success: function () {
                            cadastrarNovaAgenda(agendaData);
                            
                        },
                        error: function (error) {
                            Toastify({
                                text: "Erro ao remover a agenda existente!",
                                duration: 3000,
                                gravity: "bottom",
                                position: "right",
                                backgroundColor: "#f44336",
                                close: true,
                            }).showToast();
                        }
                    });
                } else {
                    cadastrarNovaAgenda(agendaData);
                }
            },
            error: function () {
                cadastrarNovaAgenda(agendaData);
            }
        });
    });

    function cadastrarNovaAgenda(agendaData) {
        $.ajax({
            type: 'POST',
            url: '/api/agenda',
            data: JSON.stringify(agendaData),
            contentType: 'application/json',
            success: function (response) {
                Toastify({
                    text: "Agenda definida com sucesso!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#4CAF50",
                    close: true,
                }).showToast();

                 $('#cad-agenda')[0].reset();
            },
            error: function (error) {
                Toastify({
                    text: "Erro ao definir agenda!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#f44336",
                    close: true,
                }).showToast();
            }
        });
    }
});
