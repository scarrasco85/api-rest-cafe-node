const express = require('express');
// Password encryption library: bcrypt
const bcrypt = require('bcrypt');
// Token authentication module
const jwt = require('jsonwebtoken');
// Google token authentication library
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.CLIENT_ID);

const User = require('../models/user');
// underscore library
const { isRegExp } = require('underscore');

const app = express();

//=================================================================
//  /login: Login a user
//=================================================================
app.post('/login', (req, res) => {

    let body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {

        if (err) {

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Username or password is incorrect`
                }
            });
        }

        // Compare password
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Username or password is incorrect`
                }
            });
        }

        // The token is generated
        let token = jwt.sign({
            user: userDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            user: userDB,
            token: token
        });
    });

});

// Google token verification function
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

//=================================================================
//  /google: Login a user with Google credentials
//=================================================================
app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    // Google verify function
    let googleUser = await verify(token)
        // Possible error in google verification
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            });
        });

    // user checks
    User.findOne({ email: googleUser.email }, (err, userDB) => {

        if (err) {

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (userDB) {
            // If the user did not register in our application with google credentials
            if (userDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'You are already registered in our system without using Google credentials, you must use your normal authentication.'
                    }
                });
                // If the user registered in our application with google credentials
            } else {

                // The token is generated
                let token = jwt.sign({
                    user: userDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                res.json({
                    ok: true,
                    user: userDB,
                    token: token
                });
            }
            // If the user does not exist in our database. A user is created with the 'google' property set to true  
        } else {

            let user = new User();

            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;

            // Password is required in the user model. We establish a generic password for registered users with google credentials.
            // If a user with google credentials tries to enter our system with their email and password ':)', it will never match 
            // because our system will compare it with their encryption
            user.password = ':)';

            // The user is recorded in the database
            user.save((err, userDB) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                // The token is generated
                let token = jwt.sign({
                    user: userDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                res.json({
                    ok: true,
                    user: userDB,
                    token: token
                });
            });
        }
    });

});



module.exports = app;