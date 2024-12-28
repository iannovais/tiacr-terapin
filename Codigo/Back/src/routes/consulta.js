const express = require('express');
const router = express.Router();
const ConsultaController = require('../controllers/consulta');

router.get('/pacientes', ConsultaController.getPacientes);
router.post('/', ConsultaController.criarConsulta);
router.get('/', ConsultaController.getConsultas);
router.get('/:id', ConsultaController.getConsultaByID);
router.get('/paciente/:id', ConsultaController.getConsultaByPacienteID);
router.get('/relatorio/:id', ConsultaController.getRelatorio);
router.get('/profissional/:id', ConsultaController.getConsultaByProfissionalID);
router.get('/profissionais', ConsultaController.getProfissionais); 
router.delete('/:id', ConsultaController.deletarConsulta);
router.put('/:id', ConsultaController.atualizarConsulta);
router.put('/confirmar/:id', ConsultaController.confirmarConsulta);

module.exports = router;
