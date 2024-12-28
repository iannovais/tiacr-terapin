const {db } = require('../config/bdConfig');

function criarProntuario(req, res) {
    const { consulta_id, historico_pessoal, exame_psiquico } = req.body;

    if (!consulta_id) {
        return res.status(400).json({
            error: "Erro ao coletar ID"
        });
    }

    const consultaQuery = 'SELECT * FROM consulta WHERE id = ?';
    db.query(consultaQuery, [consulta_id], (error, consultaResults) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar consulta' });
        }

        if (consultaResults.length === 0) {
            return res.status(404).json({ error: 'Consulta não encontrada' });
        }

        const q = 'INSERT INTO prontuario (consulta_id, historico_pessoal, exame_psiquico) VALUES (?, ?, ?)';
        db.query(q, [consulta_id, historico_pessoal, exame_psiquico], (error, results) => {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        error: 'Prontuário já cadastrado para essa consulta'
                    });
                }
                return res.status(500).json({ error: 'Erro ao inserir prontuário' });
            }
            return res.json({ id: results.insertId, consulta_id, historico_pessoal, exame_psiquico });
        });
    });
}

function getProntuarios(req, res) {
    const q = 'SELECT * FROM prontuario';

    db.query(q, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar prontuários' });
        }
        return res.json(results);
    });
}

function getProntuarioByConsultaID(req, res) {
    const consulta_id = req.params.consulta_id;
    const q = 'SELECT * FROM prontuario WHERE consulta_id = ?';

    db.query(q, [consulta_id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar prontuário por consulta_id' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Prontuário não encontrado para a consulta fornecida' });
        }
        return res.json(results[0]); 
    });
}

function atualizarProntuario(req, res) {
    const consulta_id = req.params.consulta_id;
    const { historico_pessoal, exame_psiquico } = req.body;

    if (!historico_pessoal || !exame_psiquico) {
        return res.status(400).json({
            error: "É necessário fornecer histórico pessoal e exame psiquico"
        });
    }

    const q = 'UPDATE prontuario SET historico_pessoal = ?, exame_psiquico = ? WHERE consulta_id = ?';
    db.query(q, [historico_pessoal, exame_psiquico, consulta_id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao atualizar prontuário' });
        }
        if (results.affectedRows > 0) {
            return res.json({ consulta_id, historico_pessoal, exame_psiquico });
        }
        return res.status(404).json({
            error: "Prontuário não encontrado para a consulta fornecida"
        });
    });
}

function getProntuariosPorPaciente(req, res) {
    const consulta_id = req.params.consulta_id;
    const q = 'SELECT * FROM prontuario p JOIN consulta c ON p.consulta_id = c.id WHERE c.paciente = ?'

    db.query(q, [consulta_id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar prontuário pelo paciente' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Prontuário não encontrado para o paciente' });
        }
        return res.json(results); 
    });
}

module.exports = {
    criarProntuario,
    getProntuarios,
    getProntuarioByConsultaID,
    atualizarProntuario,
    getProntuariosPorPaciente,
};