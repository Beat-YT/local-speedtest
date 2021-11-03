const express = require('express');
const fs = require('fs');
const os = require('os');
const xmlbuilder = require('xmlbuilder2');
var uaparser = require('ua-parser-js');
const default_stparams = require('./defaut-params.json');
const path = require('path');
const app = express.Router();
const s_html = fs.readFileSync('web/' + 'files/index.html', 'utf-8');

if (!fs.existsSync('web/history.json')) {
    fs.create
}


/**
 * @typedef {import("../types").ReportBody} ReportBody
 * @typedef {import("../types").TestResult} TestResult
 */

app.get('/api/js/servers', (req, res) => {
    res.json(
        [
            {
                "url": '',
                "lat": "0",
                "lon": "0",
                "distance": 0,
                "name": req.hostname,
                "country": 'your pc',
                "cc": "PC",
                "sponsor": os.hostname(),
                "id": "1",
                "preferred": 0,
                "https_functional": 0,
                "host": `${req.hostname}:8080`
            }
        ]
    );
});

app.get('/', (req, res) => {
    const user_agent = uaparser(req.headers['user-agent']);

    const st_params = default_stparams;
    st_params.testGlobals = {
        "ipAddress": req.ip,
        "ispName": user_agent.device.vendor && user_agent.device.model ? `${user_agent.device.vendor} ${user_agent.device.model}` : null || user_agent.browser.name || user_agent.os.name || req.headers['user-agent'].split('/')?.shift() || req.headers['user-agent'],
        "ispId": 1,
        "location": {
            "latitude": 0,
            "longitude": 0,
            "cityName": "cityName",
            "countryCode": "countryCode",
            "countryName": "countryName",
            "regionCode": "regionCode",
            "regionName": "regionName"
        }
    };

    st_params.serverList = [
        {
            "url": '',
            "lat": "0",
            "lon": "0",
            "distance": 0,
            "name": req.hostname,
            "country": 'your pc',
            "cc": "PC",
            "sponsor": os.hostname(),
            "id": "1",
            "preferred": 0,
            "https_functional": 0,
            "host": `${req.hostname}:8080`
        }
    ];

    st_params.config.rootDomain = req.hostname;

    const build = xmlbuilder.create(s_html);
    const head = build.root().find(x => x.node.nodeName == 'head');
    head.ele('script').txt(`window.ST_PARAMS = ${JSON.stringify(st_params, null, 0)}`)
    res.send(build.end({ allowEmptyTags: true, headless: true, }))
})

app.get('/result/:guid', (req, res, next) => {
    const user_agent = uaparser(req.headers['user-agent']);
    /** @type {ReportBody[]} */
    const history = JSON.parse(fs.readFileSync('web/history.json', 'utf-8'));

    const test = history.find(x => x.guid === req.params.guid);

    if (!test) {
        return next();
    }

    const st_params = default_stparams;
    st_params.testGlobals = {
        "ipAddress": req.ip,
        "ispName": user_agent.device.vendor && user_agent.device.model ? `${user_agent.device.vendor} ${user_agent.device.model}` : null || user_agent.browser.name || user_agent.os.name || req.headers['user-agent'].split('/')?.shift() || req.headers['user-agent'] || '',
        "ispId": 1,
        "location": {
            "latitude": 0,
            "longitude": 0,
            "cityName": "cityName",
            "countryCode": "countryCode",
            "countryName": "countryName",
            "regionCode": "regionCode",
            "regionName": "regionName"
        }
    };
    st_params.testReport = test;

    const build = xmlbuilder.create(s_html);
    const head = build.root().find(x => x.node.nodeName == 'head');
    head.ele('script').txt(`window.ST_PARAMS = ${JSON.stringify(st_params, null, 0)}`)
    res.send(build.end({ allowEmptyTags: true, headless: true, }))
})



app.post('/report', express.urlencoded({ extended: true }), (req, res) => {
    /** @type {TestResult[]} */
    const history = JSON.parse(fs.readFileSync('web/history.json', 'utf-8'));
    const user_agent = uaparser(req.headers['user-agent']);

    /** @type {ReportBody} */
    const payload = req.body;

    const bIsValid =
        typeof (payload.guid) == 'string' &&
        typeof (payload.configs.host) == 'string' &&
        !isNaN(parseInt(payload.serverid)) &&
        !isNaN(parseInt(payload.jitter)) &&
        !isNaN(parseInt(payload.ping)) &&
        !isNaN(parseInt(payload.uploadSpeeds.local.combined)) &&
        !isNaN(parseInt(payload.downloadSpeeds.local.combined))
        ;

    if (!bIsValid) {
        return res.sendStatus(400);
    }

    const data = {
        "ispName": user_agent.device.vendor && user_agent.device.model ? `${user_agent.device.vendor} ${user_agent.device.model}` : null || user_agent.browser.name || user_agent.os.name || req.headers['user-agent'].split('/')?.shift() || req.headers['user-agent'] || '',
        "serverSponsor": os.hostname(),
        "serverName": payload.configs.host,
        "serverId": parseInt(payload.serverid),
        "jitter": Math.round(parseInt(payload.jitter)),
        "latency": Math.round(parseInt(payload.ping)),
        "upload": parseInt(payload.uploadSpeeds.local.combined),
        "download": parseInt(payload.downloadSpeeds.local.combined),
        "guid": payload.guid,
        "resultDate": new Date().toISOString()
    }

    const existing = history.find(x => x.guid === payload.guid);

    if (existing) {
        const index = history.indexOf(existing);
        history[index] = data;
    } else {
        history.push(data);
    }

    fs.writeFile('web/history.json', JSON.stringify(history, null, 2), 'utf-8', (error) => { if (error) console.error(error) });

    res.json({ resultid: req.body.guid });
})

app.use(express.static('web/public'));

app.use((req, res) => {
    res.status(404);

    const type = req.accepts('json', 'html')

    if (type == 'json') {
        res.json({
            "userMessage": "Could not find the requested result",
            "code": "notFound",
            "statusCode": 404,
            "ookla": true
        });
    } else {
        res.sendFile(path.join(__dirname, 'files', '404.html'))
    }
})


module.exports = app;