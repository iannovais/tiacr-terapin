const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const sessionPath = process.env.WHATSAPP_SESSION_PATH || './sessions'; 

const wppMsg = new Client({
    authStrategy: new LocalAuth({
        clientId: process.env.WHATSAPP_CLIENT_ID || 'terapin', 
        dataPath: sessionPath,
    })
});

wppMsg.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

wppMsg.on('ready', () => {
    console.log("Conectado Wpp");
});

wppMsg.initialize();

module.exports = wppMsg;
