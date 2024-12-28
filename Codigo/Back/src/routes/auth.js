const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/register', authController.registerProfissional); 
router.post('/login', authController.loginProfissional);
router.get('/profissional/:id', authController.getProfissionalById);

module.exports = router;