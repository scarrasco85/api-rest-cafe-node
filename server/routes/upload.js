// Service to upload images to the server

const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const Product = require('../models/product');

const app = express();

//Middleware: fileUpload
//Este middleware hace que cuando se llame a la función fileUpload todos los archivos que se suban caen a
//req.files
// default options
app.use(fileUpload());

//Vamos a usar put en ver de post para actualizar también datos
app.put('/upload/:type/:id', function(req, res) {

    let type = req.params.type;
    let id = req.params.id;

    //Si no viene archivo
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ ok: false, err: { message: 'No files were uploaded.' } });
    }

    //Recogemos el archivo
    let file = req.files.file;

    // Type validation
    let validTypes = ['users', 'products'];
    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'The type is not valid. Only the following types are allowed: ' + validTypes.join(', ')
            }
        });
    }

    // File validation
    let validFileExts = ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'psd', 'bmp'];
    let cutNameFile = file.name.split('.');
    let extFile = cutNameFile[cutNameFile.length - 1];

    if (validFileExts.indexOf(extFile) < 0) {

        return res.status(400).json({
            ok: false,
            err: {
                message: `File extension not allowed. Only the following file extensions are allowed:
                            ${ validFileExts.join(', ') }`
            }
        });
    }

    // Filename for DB
    let fileNameDB = `${ id }-${ new Date().getMilliseconds() }.${ extFile }`;

    //upload file
    file.mv(`uploads/${ type }/${ fileNameDB }`, (err) => {
        if (err)
            return res.status(500).json({ ok: false, err });

        // In this point the file uploaded already
        switch (type) {
            case 'users':
                // Validate and update the user
                userImg(id, res, type, fileNameDB);

                // res.json({
                //     ok: true,
                //     message: 'File uploaded!'
                // });
                break;

            case 'products':
                // Validate and update the product
                productImg(id, res, type, fileNameDB);
                break;
        }

    });
});

//Recibe el id del usuario y la respuesta de donse se llama
// Validate that the user exists and update with the new image
const userImg = (id, res, type, fileNameDB) => {

    User.findById(id, (err, userBD) => {

        if (err) {

            // Delete the last file
            deleteFile(type, fileNameDB);

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!userBD) {

            // Delete the last file
            deleteFile(type, fileNameDB);

            return res.status(400).json({
                ok: false,
                message: `There is no user with id: ${ id }.`
            });
        }

        // Borrar imagen anterior si existe: como lo tenemos que usar en varios casos se ha creado la función
        // deleteFile()
        // Previous image path 
        // let pathPreviousImg = path.resolve(__dirname, `../../uploads/${ type }/${ imgName }`);

        // //.existsSync(path) devuelve true si el path existe. Si existe img anterior la borraremos
        // if (fs.existsSync(pathPreviousImg)) {
        //     //.unlinkSync(): elimina el archivo según su path
        //     fs.unlinkSync(pathPreviousImg);
        // }
        // Delete previous file if exists
        deleteFile(type, userBD.img);

        userBD.img = fileNameDB;

        userBD.save((err, userUpdated) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                user: userUpdated,
                img: fileNameDB
            })
        });


    });
}

const productImg = (id, res, type, fileNameDB) => {

    Product.findById(id, (err, productDB) => {

        if (err) {

            // Delete the last file
            deleteFile(type, fileNameDB);

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productDB) {

            // Delete the last file
            deleteFile(type, fileNameDB);

            return res.status(400).json({
                ok: false,
                message: `There is no product with id: ${ id }.`
            });
        }

        // Delete previous file if exists
        deleteFile(type, productDB.img);

        productDB.img = fileNameDB;

        productDB.save((err, productUpdated) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                product: productUpdated,
                img: fileNameDB
            })
        });

    });

}

// Delete a previous file if exists
const deleteFile = (type, imgName) => {

    // Previous image path 
    let pathPreviousImg = path.resolve(__dirname, `../../uploads/${ type }/${ imgName }`);

    //.existsSync(path) devuelve true si el path existe. Si existe img anterior la borraremos
    if (fs.existsSync(pathPreviousImg)) {
        //.unlinkSync(): elimina el archivo según su path
        fs.unlinkSync(pathPreviousImg);
    }
}


module.exports = app;