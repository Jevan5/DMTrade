const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const cryptoHelper = require('../tools/cryptoHelper');
const nodemailerHelper = require('../tools/nodemailerHelper');

const Account = require('../models/account');
const Security = require('../models/security');

router.route('/')
    // Registering
    .post(function(req, res){
        {
            req:{
                body: {
                    hashPass: 16
                }
            }
        }
        // Missing proper password format from client
        if(!req.body.hashPass || typeof(req.body.hashPass) !== 'string' || req.body.hashPass.length < 8){
            res.send({ error: 'Password must be at least 8 characters.' });
            return;
        }
        // Missing proper email format from client
        if(!req.body.email || typeof(req.body.email) !== 'string'){
            res.send({ error: 'Missing email.' });
            return;
        }
        var email = req.body.email.toLower();

        Security.find({ email: email }, function(err, securities){
            if(err){
                throw err;
            }
            // Nobody has registered with that email
            else if(securities.length === 0){
                var security = new Security();
                security.authenticationSalt = cryptoHelper.createSalt(48);
                var authentication = cryptoHelper.createSalt(48);
                security.authentication = cryptoHelper.hash(authentication, security.authenticationSalt);
                security.email = email;
                security.passSalt = cryptoHelper.createSalt(48);
                security.hashPass = cryptoHelper.hash(req.body.hashPass, security.passSalt);
                security.passChange = false;

                return nodemailerHelper.sendMail(email, 'Authenticate Email', 'SOME GET REQUEST');
            }
            else{
                
            }
        }).then(function(){
            security.save(function(err){
                if(err){
                    throw err;
                }
                res.send('Account registered, please check email for authentication link.');
            });
        }).catch(function(err){
            res.send({ error: err });
        });
    });