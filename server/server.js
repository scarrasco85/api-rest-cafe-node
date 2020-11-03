require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Importaos y usamos las rutas para usuarios
app.use(require('./routes/usuario'));

//BDD conection: URLDB lo hemos definido en el archivo /config/config.js
mongoose.connect(process.env.URLDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }).then((resp) => { console.log('Connected to Mongo!!'); })
    .catch((error) => { console.log('Error connecting to Mongo', error); });


app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
});