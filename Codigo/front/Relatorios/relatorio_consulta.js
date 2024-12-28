$(document).ready(function () {
    let consultasFiltradas = [];

    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            profissionalId: params.get('profissional'),
            periodo: params.get('periodo')
        };
    }

    function listarConsultasPorProfissional() {
        const container = $('#exibir-todos');
        const { profissionalId, periodo } = getQueryParams();

        if (!profissionalId) {
            container.html('<p>Por favor, selecione um profissional.</p>');
            return;
        }

        $.ajax({
            url: `/api/consulta/profissional/${profissionalId}`,
            type: 'GET',
            dataType: 'json',
            success: function (consultas) {
                if (consultas.length === 0) {
                    container.html('<p>Nenhuma consulta encontrada para este profissional.</p>');
                    return;
                }

                consultasFiltradas = filtrarConsultasPorPeriodo(consultas, periodo); 

                if (consultasFiltradas.length === 0) {
                    container.html('<p style="text-align: center;">Nenhuma consulta encontrada para este profissional no período estabelecido.</p>');
                    return;
                }

                renderizarTabela(consultasFiltradas);
                atualizarResumo(consultasFiltradas); 
            },
            error: function (xhr) {
                if (xhr.status === 404) {
                    container.html('<p style="text-align: center;">Nenhuma consulta encontrada para este profissional.</p>');
                } else {
                    container.html('<p>Erro ao carregar as consultas.</p>');
                }
            }
        });
    }

    function renderizarTabela(consultas) {
        const container = $('#exibir-todos');
        let tabela = `
            <table class="todos-table">
                <thead>
                    <tr>
                        <th class="th-motivo">Motivo</th>
                        <th class="th-paciente">Paciente</th>
                        <th class="th-profissional">Profissional</th>
                        <th class="th-data">Data</th>
                        <th class="th-hora">Hora</th>
                        <th class="th-valor">Valor</th>
                        <th class="th-cancelada">Cancelada</th>
                        <th> </th>
                    </tr>
                </thead>
                <tbody>
        `;

        consultas.forEach(function (consulta) {
            const dataFormatada = formatarData(consulta.data);
            const horaFormatada = consulta.hora.slice(0, 5);
            const valorFormatado = `R$ ${consulta.valor.toFixed(2).replace('.', ',')}`;
            const canceladaTexto = consulta.cancelada ? 'Sim' : 'Não';

            tabela += `
                <tr>
                    <td class="motivo-consulta">${consulta.motivo}</td>
                    <td class="paciente-consulta">${consulta.paciente_nome}</td>
                    <td class="profissional-consulta">${consulta.profissional_nome}</td>
                    <td class="data-consulta">${dataFormatada}</td>
                    <td class="hora-consulta">${horaFormatada}</td>
                    <td class="valor-consulta">${valorFormatado}</td>
                    <td class="cancelada-consulta">${canceladaTexto}</td>
                    <td> </td>
                </tr>
            `;
        });

        tabela += `</tbody></table>`;
        container.html(tabela);
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

    function formatarData(dataISO) {
        const data = new Date(dataISO);
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${dia}/${mes}/${ano}`;
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

    function exportarExcel() {
        if (consultasFiltradas.length === 0) {
            alert('Nenhuma consulta para exportar.');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(consultasFiltradas.map(consulta => ({
            'Motivo': consulta.motivo,
            'Paciente': consulta.paciente_nome,
            'Profissional': consulta.profissional_nome,
            'Data': formatarData(consulta.data),
            'Hora': consulta.hora.slice(0, 5),
            'Valor': `R$ ${consulta.valor.toFixed(2)}`,
            'Cancelada': consulta.cancelada ? 'Sim' : 'Não',
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Consultas');
        XLSX.writeFile(wb, `consultas_profissional_${consultasFiltradas[0].profissional_nome}.xlsx`);
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
            doc.addImage(imgIcone, 'JPEG', 0, 35, 200, 0);
            doc.setFontSize(15);
            doc.setFont("Helvetica", "bold");
            doc.text('Relatório de Consultas', 10, 15);

            const cabecalhos = ['Motivo', 'Paciente', 'Profissional', 'Data', 'Hora', 'Valor', 'Cancelada'];
            const linhas = consultasFiltradas.map(consulta => [
                consulta.motivo,
                consulta.paciente_nome,
                consulta.profissional_nome,
                formatarData(consulta.data),
                consulta.hora.slice(0, 5),
                `R$ ${consulta.valor.toFixed(2)}`,
                consulta.cancelada === 1 ? 'Sim' : 'Não'
            ]);

            let y = 30;
            const margemEsquerda = 10; 
            const larguraColuna = 35;

            doc.setFontSize(10);
            cabecalhos.forEach((cabecalho, index) => {
                doc.text(cabecalho, margemEsquerda + (index * larguraColuna), y);
            });

            y += 10; 

            doc.setFont("Helvetica", "normal");
            linhas.forEach(linha => {
                linha.forEach((dado, index) => {
                    const texto = doc.splitTextToSize(dado, larguraColuna);
                    texto.forEach((linhaTexto, linhaIndex) => {
                        doc.text(linhaTexto, margemEsquerda + (index * larguraColuna), y + (linhaIndex * 10));
                    });
                });
                y += 10;
                if (y > 280) { 
                    doc.addPage();
                    y = 10; 
                    cabecalhos.forEach((cabecalho, index) => {
                        doc.text(cabecalho, margemEsquerda + (index * larguraColuna), y);
                    });
                    y += 10;
                }
            });

            doc.save(`consultas_profissional_${consultasFiltradas[0].profissional_nome}.pdf`);
        };
    }

    $('#exportar-excel').click(exportarExcel);
    $('#exportar-pdf').click(exportarPDF);

    listarConsultasPorProfissional();
});
