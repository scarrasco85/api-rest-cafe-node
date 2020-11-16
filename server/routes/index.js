const express = require('express');

const app = express();


// Import and use routes of different services
app.use(require('./user'));

app.use(require('./login'));

app.use(require('./category'));

app.use(require('./product'));

app.use(require('./upload'));

app.use(require('./image'));



module.exports = app;