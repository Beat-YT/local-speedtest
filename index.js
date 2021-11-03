const express = require('express');


const web = express();
web.use(require('./web'));
web.listen(80, '0.0.0.0');

const api = express();

api.use(require('./endpoints/api'))

const server = api.listen(8080);

require('./endpoints/ws')(server)

