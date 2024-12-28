
function getConsultaId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

const consultaId = getConsultaId(); 

function isConsultaCancelada(callback) {
    if (!consultaId) return callback(false); 

    $.ajax({
        url: `/api/consulta/${consultaId}`, 
        type: 'GET',
        success: function(response) {
            callback(response.cancelada === 1); 
        },
        error: function(xhr, status, error) {
            console.error("Erro ao verificar consulta:", status, error);
            callback(false); 
        }
    });
}

function confirmarConsulta() {
    isConsultaCancelada(function(cancelada) {
        if (!consultaId) {
            Toastify({
                text: "ID da consulta não encontrado!",
                duration: 3000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#f44336",
                close: true,
            }).showToast();
            return;
        }
        
        if (cancelada) {
            Toastify({
                text: "Confirmação impossível, a consulta está cancelada.",
                duration: 3000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#f44336",
                close: true,
            }).showToast();
            return;
        }

        Toastify({
            text: "Consulta confirmada com sucesso!",
            duration: 3000,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#4CAF50",
            close: true,
        }).showToast();
    });
}

function cancelarConsulta() {
    if (!consultaId) {
        Toastify({
            text: "ID da consulta não encontrado!",
            duration: 3000,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#f44336",
            close: true,
        }).showToast();
        return;
    }

    isConsultaCancelada(function(cancelada) {
        if (cancelada) {
            Toastify({
                text: "Essa consulta já está cancelada.",
                duration: 3000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#f44336",
                close: true,
            }).showToast();
            return; 
        }

        $.ajax({
            url: `/api/consulta/${consultaId}`,  
            type: 'DELETE',
            success: function(response) {
                Toastify({
                    text: "Consulta cancelada com sucesso!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#4CAF50",
                    close: true,
                }).showToast();
            },
            error: function(xhr, status, error) {
                console.error("Erro ao cancelar consulta:", status, error);
                Toastify({
                    text: "Erro ao cancelar a consulta.",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#f44336",
                    close: true,
                }).showToast();
            }
        });
    });
}

$(document).ready(function() {
    $('#confirmar-btn').on('click', confirmarConsulta);
    $('#cancelar-btn').on('click', cancelarConsulta);
});
