const {db } = require('../config/bdConfig');

function criarPagamento(req, res) {
    let { metodo, data_pagamento, parcelas, consulta_id } = req.body; 

    if (!metodo || !data_pagamento || !parcelas || !consulta_id) {
        return res.status(400).json({
            error: "Todos os campos são obrigatórios: método, data do pagamento, parcelas e consulta_id."
        });
    }

    parcelas = parcelas.replace('x', '');

    const q = 'INSERT INTO pagamento (metodo, data_pagamento, parcelas, consulta_id) VALUES (?, ?, ?, ?)';

    db.query(q, [metodo, data_pagamento, parcelas, consulta_id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao registrar pagamento' });
        }

        const updateConsultaQuery = 'UPDATE consulta SET pago = 1 WHERE id = ?';

        db.query(updateConsultaQuery, [consulta_id], (updateError) => {
            if (updateError) {
                return res.status(500).json({ error: 'Erro ao atualizar status de pagamento da consulta' });
            }

            return res.json({ id: results.insertId, metodo, data_pagamento, parcelas, consulta_id, message: 'Pagamento registrado e consulta atualizada com sucesso' });
        });
    });
}

function getPagamentos(req, res) {
    const q = `
        SELECT p.nome_completo AS nome_paciente, pa.metodo, pa.data_pagamento, pa.parcelas, pa.id
        FROM pagamento pa
        LEFT JOIN consulta c ON c.id = pa.consulta_id
        LEFT JOIN paciente p ON p.id = c.paciente
    `;

    db.query(q, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar pagamentos' });
        }

        const pagamentosComPaciente = results.map((pagamento) => {
            if (!pagamento.nome_paciente) {
                pagamento.nome_paciente = "Paciente não associado";
            }
            return pagamento;
        });

        return res.json(pagamentosComPaciente);
    });
}

function getPagamentoByID(req, res) {
    const id = req.params.id;
    const q = `
    SELECT p.nome_completo AS nome_paciente, pa.metodo, pa.data_pagamento, pa.parcelas, c.valor, c.data AS data_consulta 
    FROM pagamento pa
    LEFT JOIN consulta c ON c.id = pa.consulta_id
    LEFT JOIN paciente p ON p.id = c.paciente
    WHERE pa.id = ?;
    `;

    db.query(q, [id], (error, results) => {
        if (error) {
            console.error('Erro ao executar a consulta SQL:', error);
            return res.status(500).json({ error: 'Erro ao buscar pagamento por ID' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }
        return res.json(results[0]);
    });
}

function getPagamentoByProfissional(req, res) {
    const id = req.params.id;
    const q = `
    SELECT p.nome_completo AS nome_paciente, 
        pa.metodo, 
        pa.data_pagamento, 
        pa.parcelas,
        pa.id,
        c.valor, 
        c.data AS data_consulta 
    FROM pagamento pa
    LEFT JOIN consulta c ON c.id = pa.consulta_id
    LEFT JOIN profissional pr ON pr.id_profissional = c.profissional
    LEFT JOIN paciente p ON p.id = c.paciente
    WHERE pr.id_profissional = ?;
    `;

    db.query(q, [id], (error, results) => {
        if (error) {
            console.error('Erro ao executar a consulta SQL:', error);
            return res.status(500).json({ error: 'Erro ao buscar pagamento por ID' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }
        return res.json(results[0]);
    });
}

function deletarPagamento(req, res) {
    const id = req.params.id;
    const q = 'DELETE FROM pagamento WHERE id = ?';

    db.query(q, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao deletar pagamento' });
        }
        if (results.affectedRows > 0) {
            return res.json({ message: 'Pagamento deletado com sucesso' });
        }
        return res.status(404).json({ error: "Pagamento não encontrado" });
    });
}

function atualizarPagamento(req, res) {
    const { metodo, data_pagamento, parcelas } = req.body;
    const id = req.params.id;
    const q = 'UPDATE pagamento SET metodo = ?, data_pagamento = ?, parcelas = ? WHERE id = ?';

    db.query(q, [metodo, data_pagamento, parcelas, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao atualizar pagamento' });
        }
        if (results.affectedRows > 0) {
            return res.json({ id, metodo, data_pagamento, parcelas });
        }
        return res.status(404).json({ error: "Pagamento não encontrado" });
    });
}

module.exports = {
    criarPagamento,
    getPagamentos,
    getPagamentoByID,
    getPagamentoByProfissional,
    deletarPagamento,
    atualizarPagamento
};
