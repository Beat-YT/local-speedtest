const Websocket = require('ws');

const start_time = new Date().toISOString();

/**
 * 
 * @param {import('http').Server} server 
 */
module.exports = function (server) {
    const wss = new Websocket.Server(
        {
            server: server,
            /**
             * 
             * @param {{ origin: string; secure: boolean; req: import('http').IncomingMessage }} info 
             */
            verifyClient: (info, callback) => {
                if (info.req.url !== '/ws') {
                    callback(false, 404, 'not found')
                } else {
                    callback(true)
                }
            }
        }
    );

    wss.on('connection', (ws, req) => {
        ws.onmessage = function (message) {
            var command = message.data;

            if (message.data.includes(' ')) 
                command = message.data.split(' ').shift()

            switch (command) {
                case 'PING': {
                    ws.send(`PONG ${Date.now()}`);
                    break;
                }

                case 'HI': {
                    ws.send(`HELLO 2.7 (2.7.5) ${start_time.split('T')[0]}.1905.a787316`);
                    break;
                }

                case 'GETIP': {
                    ws.send(`YOURIP ${req.socket.remoteAddress}`);
                    break;
                }

                case 'CAPABILITIES': {
                    ws.send('CAPABILITIES ');
                    break;
                }

                default: {
                    ws.send('ERROR')
                    break;
                }
            }
        }
    })
}