const {db}  = require('../config/bdConfig');

function criarAgenda(req, res) {
    const { id_profissional, dias_semana, data_especifica, hora_inicio, hora_fim, ativo, inicio_almoco, final_almoco } = req.body;

    if (!id_profissional || !dias_semana || !hora_inicio || !hora_fim || !inicio_almoco || !final_almoco) {
        return res.status(400).json({
            error: "É necessário fornecer id_profissional, dias_semana, hora_inicio, hora_fim, inicio_almoco e final_almoco."
        });
    }

    const deleteQuery = `
        DELETE FROM agenda 
        WHERE id_profissional = ? 
        AND dia_semana IN (?)
    `;

    db.query(deleteQuery, [id_profissional, dias_semana], (deleteError, deleteResults) => {
        if (deleteError) {
            return res.status(500).json({ error: 'Erro ao remover agendas antigas', details: deleteError.message });
        }

        const insertQuery = `
            INSERT INTO agenda (id_profissional, dia_semana, data_especifica, hora_inicio, hora_fim, ativo, inicio_almoco, final_almoco) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        let promises = dias_semana.map(dia_semana => {
            return new Promise((resolve, reject) => {
                db.query(insertQuery, [id_profissional, dia_semana, data_especifica, hora_inicio, hora_fim, ativo, inicio_almoco, final_almoco], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results.insertId);
                    }
                });
            });
        });

        Promise.all(promises)
            .then(insertIds => {
                res.json({ message: 'Agenda criada com sucesso', insertIds });
            })
            .catch(error => {
                console.error('Erro ao registrar agenda:', error);
                res.status(500).json({ error: 'Erro ao registrar agenda', details: error.message });
            });
    });
}

function getAgendas(req, res) {
    const q = 'SELECT * FROM agenda';

    db.query(q, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar agendas' });
        }
        return res.json(results);
    });
}

function getAgendaByID(req, res) {
    const id = req.params.id;
    const q = 'SELECT * FROM agenda WHERE id_agenda = ?';

    db.query(q, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar agenda por ID' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Agenda não encontrada' });
        }
        return res.json(results[0]);
    });
}

function deletarAgenda(req, res) {
    const id = req.params.id;
    const q = 'DELETE FROM agenda WHERE id_agenda = ?';

    db.query(q, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao deletar agenda' });
        }
        if (results.affectedRows > 0) {
            return res.json({ message: 'Agenda deletada com sucesso' });
        }
        return res.status(404).json({ error: "Agenda não encontrada" });
    });
}

function atualizarAgenda(req, res) {
    const { id_profissional, dia_semana, data_especifica, hora_inicio, hora_fim, ativo, inicio_almoco, final_almoco } = req.body;
    const id = req.params.id;
    const q = `
        UPDATE agenda 
        SET id_profissional = ?, dia_semana = ?, data_especifica = ?, hora_inicio = ?, hora_fim = ?, ativo = ?, inicio_almoco = ?, final_almoco = ?
        WHERE id_agenda = ?
    `;

    db.query(q, [id_profissional, dia_semana, data_especifica, hora_inicio, hora_fim, ativo, inicio_almoco, final_almoco, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao atualizar agenda' });
        }
        if (results.affectedRows > 0) {
            return res.json({ id, id_profissional, dia_semana, data_especifica, hora_inicio, hora_fim, ativo, inicio_almoco, final_almoco });
        }
        return res.status(404).json({ error: "Agenda não encontrada" });
    });
}

function getHorariosDisponiveis(req, res) {
    const id_profissional = req.params.id_profissional;
    const data = req.query.data;
    const diaDaSemana = new Date(data).getDay() + 1;
    const DURACAO_CONSULTA = 60;

    const queryAgenda = `
        SELECT hora_inicio, hora_fim, inicio_almoco, final_almoco
        FROM agenda
        WHERE id_profissional = ? AND dia_semana = ? AND ativo = 1
    `;

    db.query(queryAgenda, [id_profissional, diaDaSemana], (error, results) => {
        if (error) {
            console.error('Erro ao buscar horários disponíveis:', error);
            return res.status(500).json({ error: 'Erro ao buscar horários disponíveis' });
        }

        if (results.length === 0) {
            return res.json({ horariosDisponiveis: [] });
        }

        const horariosDisponiveis = [];

        results.forEach(agenda => {
            let { hora_inicio, hora_fim, inicio_almoco, final_almoco } = agenda;
            let startTime = new Date(`1970-01-01T${hora_inicio}`);
            let endTime = new Date(`1970-01-01T${hora_fim}`);
            let almocoInicio = new Date(`1970-01-01T${inicio_almoco}`);
            let almocoFim = new Date(`1970-01-01T${final_almoco}`);

            while (startTime < endTime) {
                if (startTime < almocoInicio || startTime >= almocoFim) {
                    horariosDisponiveis.push(startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
                }
                startTime.setMinutes(startTime.getMinutes() + DURACAO_CONSULTA);
            }
        });

        const consultaQuery = `
            SELECT hora, cancelada FROM consulta 
            WHERE data = ? AND profissional = ?
        `;

        db.query(consultaQuery, [data, id_profissional], (consultaError, consultaResults) => {
            if (consultaError) {
                return res.status(500).json({ error: 'Erro ao verificar consultas existentes' });
            }

            const horariosOcupados = consultaResults
                .filter(c => c.cancelada === 0) 
                .map(c => c.hora.substring(0, 5));
            
            const horariosFiltrados = horariosDisponiveis.filter(horario => !horariosOcupados.includes(horario));

            res.json({ horariosDisponiveis: horariosFiltrados });
        });
    });
}

function getHorariosDisponiveisParaEdicao(req, res) {
    const id_profissional = req.params.id_profissional;
    const data = req.query.data;
    const consultaId = req.query.consultaId;
    const diaDaSemana = new Date(data).getDay() + 1;

    const query = `
        SELECT hora_inicio, hora_fim, inicio_almoco, final_almoco 
        FROM agenda 
        WHERE id_profissional = ? AND dia_semana = ? AND ativo = 1
    `;

    db.query(query, [id_profissional, diaDaSemana], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar horários disponíveis' });
        }

        if (results.length === 0) {
            return res.json({ horariosDisponiveis: [] });
        }

        const horariosDisponiveis = [];

        results.forEach(agenda => {
            let { hora_inicio, hora_fim, inicio_almoco, final_almoco } = agenda;
            let startTime = new Date(`1970-01-01T${hora_inicio}`);
            let endTime = new Date(`1970-01-01T${hora_fim}`);
            let almocoInicio = new Date(`1970-01-01T${inicio_almoco}`);
            let almocoFim = new Date(`1970-01-01T${final_almoco}`);

            while (startTime < endTime) {
                if (startTime < almocoInicio || startTime >= almocoFim) {
                    horariosDisponiveis.push(startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
                }
                startTime.setMinutes(startTime.getMinutes() + 60);
            }
        });

        const consultaQuery = `SELECT hora, cancelada FROM consulta WHERE id = ?`;
        db.query(consultaQuery, [consultaId], (consultaError, consultaResult) => {
            if (consultaError) {
                return res.status(500).json({ error: 'Erro ao buscar horário da consulta atual' });
            }

            const horarioAtualConsulta = consultaResult.length ? consultaResult[0].hora.substring(0, 5) : null;

            const consultasQuery = `
                SELECT hora, cancelada FROM consulta 
                WHERE data = ? AND profissional = ? AND id != ?
            `;

            db.query(consultasQuery, [data, id_profissional, consultaId], (consultaError, consultaResults) => {
                if (consultaError) {
                    return res.status(500).json({ error: 'Erro ao verificar consultas existentes' });
                }

                const horariosOcupados = consultaResults
                    .filter(c => c.cancelada === 0)
                    .map(c => c.hora.substring(0, 5));
                
                let horariosFiltrados = horariosDisponiveis.filter(horario => !horariosOcupados.includes(horario));

                if (horarioAtualConsulta && !horariosFiltrados.includes(horarioAtualConsulta)) {
                    horariosFiltrados.push(horarioAtualConsulta);
                }

                res.json({ horariosDisponiveis: horariosFiltrados, horarioAtual: horarioAtualConsulta });
            });
        });
    });
}

function getConsultasPorProfissional(req, res) {
    const id_profissional = req.params.id_profissional;

    if (!id_profissional) {
        return res.status(400).json({ error: 'ID do profissional é obrigatório.' });
    }

    const query = `
        SELECT id, data, hora, paciente_nome, motivo
        FROM consulta
        WHERE profissional = ? AND cancelada = 0
    `;

    db.query(query, [id_profissional], (error, results) => {
        if (error) {
            console.error('Erro ao buscar consultas:', error);
            return res.status(500).json({ error: 'Erro ao buscar consultas.' });
        }

        res.json(results);
    });
}

module.exports = {
    criarAgenda,
    getAgendas,
    getAgendaByID,
    deletarAgenda,
    atualizarAgenda,
    getHorariosDisponiveis,
    getHorariosDisponiveisParaEdicao,
    getConsultasPorProfissional
};
