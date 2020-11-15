// Service to serve images to the client

const express = require('express');
const fs = require('fs');
const path = require('path');
const { verifyImgToken } = require('../middlewares/authentication');

const app = express();

app.get('/image/:type/:img', verifyImgToken, (req, res) => {

    let type = req.params.type;
    let img = req.params.img;

    let pathImg = path.resolve(__dirname, `../../uploads/${ type }/${ img }`);


    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        let noImagePath = path.resolve(__dirname, `../assets/no-image.jpg`);
        res.sendFile(noImagePath);
    }


});

module.exports = app;