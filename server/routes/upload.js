// Service to upload images to the server

const express = require('express');
// Library to upload files
const fileUpload = require('express-fileupload');
// Library for working with files
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const Product = require('../models/product');

const app = express();

//Middleware: fileUpload. Take the file to 'req.files.file'
app.use(fileUpload());

//=================================================================
//  /upload: Upload an image and update the user or product
//=================================================================
app.put('/upload/:type/:id', function(req, res) {

    let type = req.params.type;
    let id = req.params.id;

    // If file field is empty
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ ok: false, err: { message: 'No files were uploaded.' } });
    }

    let file = req.files.file;
    console.log({ file });
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

                break;

            case 'products':
                // Validate and update the product
                productImg(id, res, type, fileNameDB);
                break;
        }

    });
});

// Function: Validate that the user exists and update with the new image
const userImg = (id, res, type, fileNameDB) => {

    User.findById(id, (err, userBD) => {

        if (err) {

            // Delete the actual file
            deleteFile(type, fileNameDB);

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!userBD) {

            // Delete the actual file
            deleteFile(type, fileNameDB);

            return res.status(400).json({
                ok: false,
                message: `There is no user with id: ${ id }.`
            });
        }

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

// Function: Validate that the product exists and update with the new image
const productImg = (id, res, type, fileNameDB) => {

    Product.findById(id, (err, productDB) => {

        if (err) {

            // Delete the actual file
            deleteFile(type, fileNameDB);

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productDB) {

            // Delete the actual file
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

// Function: Delete a file if exists
const deleteFile = (type, imgName) => {

    let pathFile = path.resolve(__dirname, `../../uploads/${ type }/${ imgName }`);

    if (fs.existsSync(pathFile)) {

        fs.unlinkSync(pathFile);
    }
}

module.exports = app;