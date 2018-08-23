const jwt = require('jsonwebtoken');
const {TokenExpiredError} = jwt;
const config = require('../config.json');
const request = require('request');
const jwkToPem = require('jwk-to-pem');

function ValidateToken(token) {
    return request({
        url: `https://cognito-idp.${config.region}.amazonaws.com/${config.userPool}/.well-known/jwks.json`,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            pems = {};
            var keys = body['keys'];
            for(var i = 0; i < keys.length; i++) {
                //Convert each key to PEM
                var key_id = keys[i].kid;
                var modulus = keys[i].n;
                var exponent = keys[i].e;
                var key_type = keys[i].kty;
                var jwk = { kty: key_type, n: modulus, e: exponent};
                var pem = jwkToPem(jwk);
                pems[key_id] = pem;
            }
            //validate the token
            var decodedJwt = jwt.decode(token, {complete: true});
            if (!decodedJwt) {
                return new Error('Not a valid JWT token');
            }

            var kid = decodedJwt.header.kid;
            var pem = pems[kid];
            if (!pem) {
                return new Error('Invalid token');
            }

            jwt.verify(token, pem, function(err, payload) {
                if(err) {
                    return new Error('Invalid token');

                } else {
                    //console.log("Valid Token.");
                    //console.log(payload);
                    return 'valid';
                }
            });
        } else {
            return new Error('Error! Unable to download JWKs');
        }
    });
}

module.exports = () => (req, res, next) => {
    const {split} = require('lodash');
    const header = req.get('Authorization');
    //console.log('header', header);
    if (!header) {
        return res.sendStatus(401);
    }
    const token = split(header, /\s+/).pop();
    if (!token) {
        return res.sendStatus(401);
    }
    try {
        const status = ValidateToken(token);
        //console.log('status', status);
        //if (status === 'valid'){
        //    return next();
        //}
        return next();
        console.log('no debería llegar acá');
        //req.user = jwt.verify(token, 'secret');
    } catch (err) {
        console.log('err!!!', err);
        if (err instanceof TokenExpiredError) {
            res.status(401).send({tokenExpired: true});
            return;
        }
        next(err);
    }
};
