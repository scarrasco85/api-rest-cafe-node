const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

//Middleware: fileUpload
//Este middleware hace que cuando se llame a la función fileUpload todos los archivos que se suban caen a
//req.files
// default options
app.use(fileUpload());

//Vamos a usar put en ver de post para actualizar también datos
app.put('/upload', function(req, res) {

    //Si no viene archivo
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ ok: false, err: { message: 'No files were uploaded.' } });
    }

    let file = req.files.file;

    file.mv('uploads/filename.jpg', (err) => {
        if (err)
            return res.status(500).json({ ok: false, err });

        res.json({
            ok: true,
            message: 'File uploaded!'
        });
    });
});

module.exports = app;