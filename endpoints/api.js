const express = require('express');
const app = express.Router();
const crypto = require('crypto');

const start_time = new Date().toISOString();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
function options(req, res) {
    for (let name in req.headers) {
        if (!name.startsWith('access-control-request-')) {
            continue;
        }
        const type = name.replace('access-control-request-', '');
        if (type == 'origin') {
            continue;
        }

        const value = req.headers[name];
        res.setHeader(`Access-Control-Allow-${type}`, value);
    }

    res.status(204);
    res.end();
}

app.route('/download')
    .get((req, res) => {
        res.setHeader('content-type', 'application/octet-stream');
        const size = (parseInt(req.query.size) || 250000000);
        res.end(Buffer.allocUnsafe(size));
    })
    .options(options);


app.route('/upload')
    .post(express.raw({ limit: '1gb' }), (req, res) => {
        res.end(`size=${req.headers['content-length'] || req.body.length}`)
    })
    .options(options);


app.route('/hello')
    .get((req, res) => {
        res.end(`hello 2.7 (2.7.5) ${start_time.split('T')[0]}.1905.a787316`)
    }).options(options);



app.route('/getip')
    .get((req, res) => {
        if (req.ip == '::1') {
            return res.end('127.0.0.1')
        }
        res.end(req.ip.split(':').pop())
    }).options(options);

app.route('/ping')
    .get((req, res) => {
        res.end('pong');
    }).options(options);


module.exports = app;