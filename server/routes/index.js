const express = require('express');

const app = express();


//Importamos y usamos las rutas para el usuarios
app.use(require('./usuario'));
//Importamos y usamos las rutas para el login
app.use(require('./login'));
// Import categories routes
app.use(require('./category'));
// Import products routes
app.use(require('./product'));
// Import upload files routes
app.use(require('./upload'));
// Import image files routes
app.use(require('./image'));



module.exports = app;