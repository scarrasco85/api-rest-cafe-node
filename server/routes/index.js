const express = require('express');

const app = express();


//Importamos y usamos las rutas para el usuarios
app.use(require('./usuario'));
//Importamos y usamos las rutas para el login
app.use(require('./login'));


module.exports = app;