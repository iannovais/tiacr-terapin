const express = require('express');
const router = express.Router();

const convenioRoutes = require('./convenio.js');
const consultaRoutes = require('./consulta.js'); 
const pacienteRoutes = require('./paciente.js');
const prontuarioRoutes = require('./prontuario.js');
const pagamentoRoutes = require('./pagamento.js');
const profissionalRoutes = require('./profissional.js');
const agendaRoutes = require('./agenda.js');
const authRoutes = require('./auth.js');

router.use('/convenio', convenioRoutes);
router.use('/consulta', consultaRoutes);
router.use('/paciente', pacienteRoutes);
router.use('/prontuario', prontuarioRoutes);
router.use('/pagamento', pagamentoRoutes);
router.use('/profissional', profissionalRoutes);
router.use('/agenda', agendaRoutes);
router.use('/auth', authRoutes);

module.exports = router;
