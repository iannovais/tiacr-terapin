const express = require('express');
const router = express.Router();

const ProntuarioController = require('../controllers/prontuario');

router.post('/', ProntuarioController.criarProntuario);
router.get('/', ProntuarioController.getProntuarios);
router.get('/:consulta_id', ProntuarioController.getProntuarioByConsultaID);
router.get('/prontuarios/:consulta_id', ProntuarioController.getProntuariosPorPaciente);
router.put('/:consulta_id', ProntuarioController.atualizarProntuario);

module.exports = router;
