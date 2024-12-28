const express = require('express');
const router = express.Router();
const AgendaController = require('../controllers/agenda');

router.get('/consulta/profissional/:id_profissional', AgendaController.getConsultasPorProfissional);
router.get('/agenda/disponibilidade/:id_profissional', AgendaController.getHorariosDisponiveis);
router.post('/', AgendaController.criarAgenda);
router.get('/', AgendaController.getAgendas);
router.get('/:id', AgendaController.getAgendaByID);
router.delete('/:id', AgendaController.deletarAgenda);
router.put('/:id', AgendaController.atualizarAgenda);
router.get('/disponibilidade/:id_profissional', AgendaController.getHorariosDisponiveis);
router.get('/disponibilidade-edicao/:id_profissional', AgendaController.getHorariosDisponiveisParaEdicao);

module.exports = router;
