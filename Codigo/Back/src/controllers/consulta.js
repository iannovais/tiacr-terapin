const {db } = require('../config/bdConfig');
const wppMsg = require('../config/whatsappClient');

const schedule = require('node-schedule');

const formatarData = (data) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(data).toLocaleDateString('pt-BR', options);
};

const formatarHora = (hora) => {
    const [hour, minute] = hora.split(':');
    return `${hour}:${minute}`;
};

const criarConsulta = (req, res) => {
    const { motivo, paciente, profissional, data, hora, retorno, valor } = req.body;

    const erro = validarConsulta(motivo, paciente, profissional, data, hora);

    if (erro) return res.status(400).json({ error: erro });

    inserirConsulta(motivo, paciente, profissional, data, hora, retorno, valor)
        .then((consultaId) => { 
            return buscarInformacoesPaciente(paciente)
                .then(pacienteInfo => buscarInformacoesProfissional(profissional)
                    .then(profissionalInfo => agendarEnvioMensagem(consultaId, pacienteInfo, profissionalInfo, data, hora)));
        })
        .then(() => res.status(201).json({ message: 'Consulta agendada com sucesso' }))
        .catch(err => res.status(err.status || 500).json({ error: err.message }));
};

const validarConsulta = (motivo, paciente, profissional, data, hora) => {
    if (!motivo || !paciente || !profissional || !data || !hora) {
        return 'Todos os campos são obrigatórios';
    }
    return null;
};

const inserirConsulta = (motivo, paciente, profissional, data, hora, retorno, valor) => {
    const query = `
        INSERT INTO consulta (motivo, paciente, profissional, data, hora, retorno, valor, cancelada, pago)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [motivo, paciente, profissional, data, hora, retorno, valor], (error, results) => {
            if (error) {
                return reject({ status: 500, message: 'Erro ao marcar a consulta' });
            }

            resolve(results.insertId);
        });
    });
};

const buscarInformacoesPaciente = (paciente) => {
    const pacienteQuery = 'SELECT * FROM paciente WHERE id = ?';
    return new Promise((resolve, reject) => {
        db.query(pacienteQuery, paciente, (error, results) => {
            if (error) {
                return reject({ status: 500, message: 'Erro ao buscar o nome do paciente' });
            }
            if (results.length === 0) {
                return reject({ status: 404, message: 'Paciente não encontrada' });
            }
            resolve(results[0]);
        });
    });
};

const buscarInformacoesProfissional = (profissional) => {
    const profissionalQuery = 'SELECT * FROM profissional WHERE id_profissional = ?';
    return new Promise((resolve, reject) => {
        db.query(profissionalQuery, profissional, (error, results) => {
            if (error) {
                return reject({ status: 500, message: 'Erro ao buscar o nome do profissional' });
            }
            if (results.length === 0) {
                return reject({ status: 404, message: 'Profissional não encontrado' });
            }
            resolve(results[0]);
        });
    });
};

const confirmarConsulta = (req, res) => {
    const { id } = req.params;  

    if (!id) {
        return res.status(400).json({ error: 'ID da consulta é obrigatório.' });
    }

    const queryVerificaConsulta = 'SELECT id, cancelada FROM consulta WHERE id = ?';
    db.query(queryVerificaConsulta, [id], (error, results) => {
        if (error) {
            console.error('Erro ao verificar consulta:', error);
            return res.status(500).json({ error: 'Erro interno ao verificar consulta.' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Consulta não encontrada.' });
        }

        const consulta = results[0];

        if (consulta.cancelada === '1') {
            return res.status(400).json({ error: 'Consulta já está cancelada e não pode ser confirmada.' });
        }

        const queryConfirmarConsulta = 'UPDATE consulta SET cancelada = "0" WHERE id = ?';
        db.query(queryConfirmarConsulta, [id], (updateError) => {
            if (updateError) {
                console.error('Erro ao confirmar consulta:', updateError);
                return res.status(500).json({ error: 'Erro ao confirmar consulta.' });
            }

            return res.status(200).json({ message: 'Consulta confirmada com sucesso.' });
        });
    });
};

const agendarEnvioMensagem = (consultaId, pacienteInfo, profissionalInfo, data, hora) => {
    const telefonePaciente = '55' + pacienteInfo.telefone;
    const dataConsulta = new Date(`${data}T${hora}`);
    const dataEnvio = new Date(dataConsulta.getTime() - 24 * 60 * 60 * 1000);

    const linkConfirmacao = `http://localhost:3000/ConfirmarConsulta/confirmar_consulta.html?id=${consultaId}`;
    const mensagem = `🩺 *TERAPIN INFORMA:*\n\n*${pacienteInfo.nome_completo}*, você possui uma consulta agendada na Clínica Mônica para o dia *${formatarData(dataConsulta)}* às *${formatarHora(hora)}* com Dr(a) *${profissionalInfo.nome}*.\n\nPara confirmar ou cancelar sua consulta, acesse o link: ${linkConfirmacao}`;


    schedule.scheduleJob(dataEnvio, () => {
        wppMsg.sendMessage(`${telefonePaciente}@c.us`, mensagem)
            .catch(err => console.error('Erro ao enviar a mensagem:', err));
    });
};

function getConsultas(req, res) {
    const q = `
        SELECT c.*, p.nome_completo AS paciente_nome, pr.id AS prontuarioId, prof.nome AS profissional_nome, pa.id AS pagamentoId
        FROM consulta c
        LEFT JOIN paciente p ON c.paciente = p.id
        LEFT JOIN prontuario pr ON c.id = pr.consulta_id
        LEFT JOIN profissional prof ON c.profissional = prof.id_profissional
        LEFT JOIN pagamento pa ON c.id = pa.consulta_id
    `;

    db.query(q, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar consultas' });
        }
        return res.json(results);
    });
}

function getConsultaByID(req, res) {
    const id = req.params.id;
    const q = `
        SELECT c.*, p.nome_completo AS paciente_nome
        FROM consulta c
        LEFT JOIN paciente p ON c.paciente = p.id
        WHERE c.id = ?
    `;

    db.query(q, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar consulta por ID' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Consulta não encontrada' });
        }
        return res.json(results[0]);
    });
}

function getConsultaByPacienteID(req, res) {
    const pacienteId = req.params.id;
    const q = `
        SELECT c.id AS consulta_id,  c.*, p.nome_completo AS paciente_nome, p.cpf AS paciente_cpf, pr.id AS prontuarioId, prof.nome AS profissional_nome
        FROM consulta c 
        LEFT JOIN paciente p ON c.paciente = p.id
        LEFT JOIN prontuario pr ON pr.consulta_id = c.id -- Faz o join com a tabela de prontuário
        LEFT JOIN profissional prof ON c.profissional = prof.id_profissional -- Adicionando o join com a tabela de profissional
        WHERE c.paciente = ?
    `;

    db.query(q, [pacienteId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar consultas pelo ID do paciente' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Nenhuma consulta encontrada para este paciente' });
        }
        return res.json(results);
    });
}

function getConsultaByProfissionalID(req, res) {
    const profissionalId = req.params.id;
    const periodo = req.query.periodo; 

    let query = `
        SELECT 
            c.id AS consulta_id, 
            c.*, 
            p.nome_completo AS paciente_nome, 
            pr.id AS prontuarioId,
            prof.nome AS profissional_nome
        FROM consulta c 
        LEFT JOIN paciente p ON c.paciente = p.id
        LEFT JOIN prontuario pr ON pr.consulta_id = c.id 
        LEFT JOIN profissional prof ON c.profissional = prof.id_profissional 
        WHERE c.profissional = ?
    `;

    let queryParams = [profissionalId];

    if (periodo) {
        query += ' AND c.data BETWEEN ? AND ?';
        const datas = obterIntervaloDeDatas(periodo);
        queryParams.push(datas.inicio, datas.fim);
    }

    db.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('Erro ao buscar consultas pelo ID do profissional:', error);
            return res.status(500).json({ error: 'Erro ao buscar consultas pelo ID do profissional' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Nenhuma consulta encontrada para este profissional' });
        }
        return res.json(results);
    });
}

function deletarConsulta(req, res) {
    const id = req.params.id;
    const q = 'UPDATE consulta SET cancelada = 1 WHERE id = ?';

    db.query(q, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao cancelar consulta' });
        }
        if (results.affectedRows > 0) {
            return res.json({ message: 'Consulta cancelada com sucesso' });
        }
        return res.status(404).json({
            error: "Consulta não encontrada"
        });
    });
}

function atualizarConsulta(req, res) {
    const { motivo, paciente, profissional, data, hora, retorno, valor, cancelada } = req.body; 
    const id = req.params.id;
    const q = 'UPDATE consulta SET motivo = ?, paciente = ?, profissional = ?, data = ?, hora = ?, retorno = ?, valor = ?, cancelada = ? WHERE id = ?';

    db.query(q, [motivo, paciente, profissional, data, hora, retorno, valor, cancelada, id], (error, results) => {
        if (error) {
            console.error('Erro ao executar a consulta de atualização:', error);
            return res.status(500).json({ error: 'Erro ao atualizar consulta' });
        }
        if (results.affectedRows > 0) {
            return res.json({ id, motivo, paciente, profissional, data, hora, retorno, valor, cancelada });  
        }
        return res.status(404).json({
            error: "Consulta não encontrada"
        });
    });
}

function getPacientes(req, res) {
    const q = 'SELECT id, nome_completo FROM paciente';

    db.query(q, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar pacientes' });
        }
        return res.json(results);
    });
}

function getProfissionais(req, res) {
    const q = 'SELECT id_profissional, nome FROM profissional';

    db.query(q, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar profissionais' });
        }
        return res.json(results);
    });
}

function getRelatorio(req, res) {
    const id = req.params.id;
    const q = ` SELECT COUNT(c.id) AS total_consultas,  COUNT(CASE WHEN c.cancelada = 1 THEN 1 END) AS consultas_canceladas
                FROM consulta c
                WHERE c.paciente = ?`;

    db.query(q, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar paciente' });
        }
        return res.json(results);
    });
}

module.exports = {
    criarConsulta,
    getConsultas,
    getConsultaByID,
    getConsultaByPacienteID,
    getConsultaByProfissionalID,
    deletarConsulta,
    atualizarConsulta,
    confirmarConsulta,
    getPacientes,
    getProfissionais,
    getRelatorio
};