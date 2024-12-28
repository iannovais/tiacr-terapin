const express = require('express');
const path = require('path');
const rotasApi = require('./routes/api');
const authRoutes = require('./routes/auth');
const wppMsg = require('./config/whatsappClient');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);

app.use('/api', rotasApi);

app.use(express.static(path.join(__dirname, '../../front')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../front', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor está ON na porta ${port}!`);
});
