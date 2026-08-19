const { Client } = require('discord-rpc');
const { WebSocketServer } = require('ws');

const CLIENT_ID = '1539419892426739822';

const rpc = new Client({ transport: 'ipc' });
const wss = new WebSocketServer({ 
  port: 8080,
  verifyClient: (info, callback) => {
    // Permet d'accepter les requêtes de GitHub Pages et du localhost
    callback(true);
  }
});

let isRpcReady = false;

rpc.on('ready', () => {
  console.log('✅ Connecté à Discord !');
  isRpcReady = true;
});

rpc.login({ clientId: CLIENT_ID }).catch((err) => {
  console.error('❌ Erreur de connexion à Discord (l’application Discord est-elle lancée ?) :', err);
});

wss.on('connection', (ws) => {
  console.log('🔗 Un navigateur s’est connecté au script');

  ws.on('message', (data) => {
    if (!isRpcReady) {
      console.log('⚠️ RPC non prêt pour le moment');
      return;
    }

    try {
      const payload = JSON.parse(data);

      if (payload.action === 'playing') {
        console.log(`🎵 Lecture de : ${payload.title}`);
        rpc.setActivity({
          details: `Écoute ${payload.title}`,
          state: 'Sur boro700e.github.io/boro700/',
          largeImageKey: 'logo',
          largeImageText: 'boro700',
          instance: false,
        });
      } else if (payload.action === 'paused') {
        console.log('⏸️ Musique en pause');
        rpc.clearActivity();
      }
    } catch (e) {
      console.error('Erreur de lecture du message :', e);
    }
  });
});