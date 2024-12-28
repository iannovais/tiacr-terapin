$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    const pacienteId = params.get('paciente');
    let consultasFiltradas = []; 

    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            pacienteId: params.get('paciente'),
            periodo: params.get('periodo')
        };
    }

    function listarConsultasPorPaciente() {
        const exibirTodos = $('#exibir-todos');
        const { pacienteId, periodo } = getQueryParams();

        if (!pacienteId) {
            exibirTodos.html('<p>Por favor, selecione um paciente.</p>');
            return;
        }

        $.ajax({
            type: 'GET',
            url: `/api/consulta/paciente/${pacienteId}`,
            success: function (consultas) {
                if (consultas.length === 0) {
                    exibirTodos.html('<p>Nenhuma consulta encontrada para este paciente.</p>');
                    return;
                }

                consultasFiltradas = filtrarConsultasPorPeriodo(consultas, periodo); 

                if (consultasFiltradas.length === 0) {
                    exibirTodos.html('<p style="text-align: center;">Nenhuma consulta encontrada para este paciente no período estabelecido.</p>');
                    return;
                }

                renderizarTabela(consultasFiltradas);
                atualizarResumo(consultasFiltradas);
            },
            error: function (xhr, status, error) {
                renderizarTabela([], 'Nenhuma consulta encontrada para este paciente');
            }
        });
    }

    function renderizarTabela(consultas, mensagemErro = null) {
        const exibirTodos = $('#exibir-todos');
        exibirTodos.empty();

        const tabela = `
            <table id="tabela-consultas">
                <thead>
                    <tr>
                        <th>Paciente</th>
                        <th>CPF</th>
                        <th>Data</th>
                        <th>Cancelada</th>
                        <th>Nome da Consulta</th>
                        <th> </th>
                    </tr>
                </thead>
                <tbody>
                    ${mensagemErro ?
            `<tr><td colspan="5" style="text-align: center;">${mensagemErro}</td></tr>` :
            consultas.map(consulta => {
                const consultaCancelada = consulta.cancelada ? "sim" : "não";
                const dataConsulta = new Date(consulta.data);
                const dataFormatada = dataConsulta.toLocaleDateString('pt-BR');
                return `
                                <tr>
                                    <td>${consulta.paciente_nome}</td>
                                    <td>${consulta.paciente_cpf}</td>
                                    <td>${dataFormatada}</td>
                                    <td>${consultaCancelada}</td>
                                    <td>${consulta.motivo}</td>
                                    <td> </td>
                                </tr>
                            `;
            }).join('')}
                </tbody>
            </table>
        `;

        exibirTodos.append(tabela);
    }

    function filtrarConsultasPorPeriodo(consultas, periodo) {
        const agora = new Date();
        agora.setHours(0, 0, 0, 0); 

        return consultas.filter(consulta => {
            const dataConsulta = new Date(consulta.data);
            dataConsulta.setHours(0, 0, 0, 0); 

            switch (periodo) {
                case 'dia-atual':
                    return dataConsulta.getTime() === agora.getTime();
                case 'dia-anterior':
                    const ontem = new Date(agora);
                    ontem.setDate(agora.getDate() - 1);
                    return dataConsulta.getTime() === ontem.getTime();
                case 'sem-atual':
                    const inicioSemana = new Date(agora);
                    inicioSemana.setDate(agora.getDate() - agora.getDay());
                    return dataConsulta >= inicioSemana && dataConsulta <= agora;
                case 'sem-anterior':
                    const inicioSemanaAnterior = new Date(agora);
                    inicioSemanaAnterior.setDate(agora.getDate() - agora.getDay() - 7);
                    const fimSemanaAnterior = new Date(inicioSemanaAnterior);
                    fimSemanaAnterior.setDate(inicioSemanaAnterior.getDate() + 6);
                    return dataConsulta >= inicioSemanaAnterior && dataConsulta <= fimSemanaAnterior;
                case 'mes-atual':
                    return dataConsulta.getMonth() === agora.getMonth() && dataConsulta.getFullYear() === agora.getFullYear();
                case 'mes-anterior':
                    const mesAnterior = new Date(agora);
                    mesAnterior.setMonth(agora.getMonth() - 1);
                    return dataConsulta.getMonth() === mesAnterior.getMonth() && dataConsulta.getFullYear() === mesAnterior.getFullYear();
                case 'ano-atual':
                    return dataConsulta.getFullYear() === agora.getFullYear();
                case 'ano-anterior':
                    return dataConsulta.getFullYear() === agora.getFullYear() - 1;
                default:
                    return true;
            }
        });
    }

    function atualizarResumo(consultas) {
        const totalConsultas = consultas.length;
        const consultasCanceladas = consultas.filter(consulta => consulta.cancelada).length;

        const resumo = `
            <div class="dashboard">
                <div class="dashboard-titulo"> <i class="uil uil-medkit"></i> Total de Consultas </div> 
                <div class="dashboard-quantidade"> ${totalConsultas} </div>
            </div>
            <div class="dashboard">
                <div class="dashboard-titulo"> <i class="uil uil-times-circle"></i> Consultas Canceladas </div> 
                <div class="dashboard-quantidade"> ${consultasCanceladas} </div> 
            </div>
        `;

        $('#resumo-consultas').html(resumo); 
    }

    function formatarData(dataISO) {
        const data = new Date(dataISO);
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${dia}/${mes}/${ano}`;
    }

    function exportarExcel() {
        if (consultasFiltradas.length === 0) {
            alert('Nenhuma consulta para exportar.');
            return;
        }

        const pacienteNome = consultasFiltradas[0].paciente_nome.replace(/,/g, '');
        const ws = XLSX.utils.json_to_sheet(consultasFiltradas.map(consulta => ({
            'Paciente': consulta.paciente_nome,
            'CPF': consulta.paciente_cpf,
            'Data': formatarData(consulta.data),
            'Cancelada': consulta.cancelada ? 'sim' : 'não',
            'Nome da Consulta': consulta.motivo
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Consultas');
        XLSX.writeFile(wb, `paciente_${pacienteNome}.xlsx`);
    }

    function exportarPDF() {
        if (consultasFiltradas.length === 0) {
            alert('Nenhuma consulta para exportar.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const imgIcone = new Image();
        imgIcone.src = '../assets/imagens/Terapin - IconeOpaco.png';

        imgIcone.onload = function () {
            doc.addImage(imgIcone, 'JPEG', 0, 35, 200, 0); // margem direita, margem topo, tamanho, ?

            doc.setFontSize(15);
            doc.setFont("Helvetica", "bold");
            doc.text('Relatório de Paciente', 10, 15);

            const cabecalhos = ['Paciente', 'CPF', 'Data', 'Cancelada', 'Nome da Consulta'];
            const linhas = consultasFiltradas.map(consulta => [
                consulta.paciente_nome,
                consulta.paciente_cpf,
                formatarData(consulta.data),
                consulta.cancelada ? 'sim' : 'não',
                consulta.motivo
            ]);

            let y = 30;

            doc.setFontSize(10);
            cabecalhos.forEach((cabecalho, index) => {
                doc.text(cabecalho, 10 + (index * 40), y);
            });

            doc.setFont("Helvetica", "normal");
            doc.setFontSize(10);
            linhas.forEach(linha => {
                y += 10;
                linha.forEach((dado, index) => {
                    doc.text(dado, 10 + (index * 40), y);
                });
            });

            const pacienteNome = consultasFiltradas[0].paciente_nome.replace(/,/g, '');
            doc.save(`paciente_${pacienteNome}.pdf`);
        };
    }

    listarConsultasPorPaciente();

    $('#exportar-pdf').click(function () {
        exportarPDF();
    });

    $('#exportar-excel').click(function () {
        exportarExcel();
    });
});
