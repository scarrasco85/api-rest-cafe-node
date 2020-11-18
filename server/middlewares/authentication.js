// jsonwebtoken library
const jwt = require('jsonwebtoken');



//=================================================================
//  Token verify
//=================================================================
const verifyToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {

            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Invalid token.'
                }
            });
        }

        // If everything has gone well, we take the data of the 'payload' and we put it in the req
        req.user = decoded.user;

        next();
    });

}

//=================================================================
//  'ROLE_ADMIN' Verify
//=================================================================
let verifyAdminRole = (req, res, next) => {

    let user = req.user;

    if (user.role != 'ADMIN_ROLE' || user.role == undefined) {

        return res.status(400).json({
            ok: false,
            message: 'Only users with an administrator role have permissions to perform this operation.'
        });
    }

    next();
}

//=================================================================
//  Token verify by URL for images
//=================================================================
let verifyImgToken = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {

            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Invalid token.'
                }
            });
        }

        // If everything has gone well, we take the data of the 'payload' and we put it in the req
        req.user = decoded.user;

        next();
    });

}

module.exports = {
    verifyToken,
    verifyAdminRole,
    verifyImgToken
}