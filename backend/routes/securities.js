const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const cryptoHelper = require('../tools/cryptoHelper');
const isValidId = require('../tools/idHelper').isValidId;
const logErr = require('../tools/logHelper').logErr;
const nodemailerHelper = require('../tools/nodemailerHelper');

const Account = require('../models/account');
const Security = require('../models/security');

const ourService = 'gmail';
const Environment = require('../environment');

router.route('/')
    // See all current securities
    .get(function(req, res){
        Security.find().then(function(securities){
            res.send({ securities: securities });
        }).catch(function(err){
            logErr(err);
            res.send({ error: err });
        });
    })
    // Registering
    .post(function(req, res){
        // Missing proper password format from client
        if(!req.body.hashPass || typeof(req.body.hashPass) !== 'string' || req.body.hashPass.length < 8){
            res.status(400).send('Password must be at least 8 characters.');
            return;
        }
        // Missing proper email format from client
        if(!req.body.email || typeof(req.body.email) !== 'string'){
            res.status(400).send('Missing email.');
            return;
        }
        var email = req.body.email.toLowerCase();
        var security;

        Security.find({ email: email }).then(function(securities){
            // Only 1 person has registered with that email
            if(securities.length === 1){
                // They have also authenticated their email already
                if(securities[0].passChange || !securities[0].authentication){
                    res.status(400).send('Email already taken.');
                    throw '';
                }
            }
            // Nobody has authenticated this email yet
            security = new Security();
            security.account = null;
            security.salt = cryptoHelper.createSalt(48);
            var authentication = cryptoHelper.createSalt(48);
            security.authentication = cryptoHelper.hash(authentication, security.salt);
            security.email = email;
            security.hashPass = cryptoHelper.hash(req.body.hashPass, security.salt);
            security.passChange = '';

            return nodemailerHelper.sendMail(email, 'Authenticate Email', `Please click the link below to authenticate your account:\n\n${Environment.instance.url}:${Environment.instance.port}/authenticate/email/${security._id}/${authentication}`);
        }).then(function(){// Once email has been successfully sent, save the entry into the database
            return security.save();
        }).then(function(){
            // Once the entry has been saved, send a response to the client
            res.send({
                message: 'Account registered, please check ' + email + ' for authentication link.',
                security: security
            });
        }).catch(function(err){
            if(err){
                logErr(err);
                res.status(500).send(err);
            }
        });
    });

router.route('/:email')
    // Requesting to change password
    .put(function(req, res){
        // Improper email format
        if(typeof(req.params.email) !== 'string'){
            res.send({ error: 'Email must be a string.' });
            return;
        }
        // Improper new password format
        if(!req.body.passChange || typeof(req.body.passChange) !== 'string' || req.body.passChange.length < 8){
            res.send({ error: 'New password must be a string of at least 8 characters.' });
            return;
        }
        var email = req.params.email.toLowerCase();
        var security;
        // Finding accounts with matching email
        Security.find({ email: email }).then(function(securities){
            // No matching email
            if(securities.length === 0){
                throw 'No account with matching email found.';
            }
            // Too many matching emails, meaning none have been authenticated yet
            else if(securities.length > 1){
                throw 'Must authenticate account first.';
            }
            // Authentication is non-empty, but passChange is. Meaning they have not authenticated
            else if(securities[0].authentication && !securities[0].passChange){
                throw 'Must authenticate account first.';
            }
            security = securities[0];
            let transporter = nodemailer.createTransport({
                service: ourService,
                auth: {
                    user: ourEmail,
                    pass: ourPass
                }
            });
        
            let mailOptions = {
                from: ourEmail,
                to: email,
                subject: 'Authenticate Password Change',
                text: `Please click the link below to confirm your password change:\n\n${Environment.instance.url}:${Environment.instance.port}/authenticate/passwordChange/${security._id}/${authentication}`
            };
            return transporter.sendMail(mailOptions);
        }).then(function(){
            security.passChange = cryptoHelper.hash(req.body.hashPass, security.salt);
            return security.save();
        }).then(function(){
            res.send({ message: 'Please check your email for a link to confirm your password change.' });
        }).catch(function(err){
            logErr(err);
            res.send({ error: err });
        });
    });

router.route('/:email/:password')
    // Logging in
    .get(function(req, res){
        // Improper email format
        if(typeof(req.params.email) !== 'string'){
            res.status(400).send({ error: 'Email must be a string.' });
            return;
        }
        // Improper password format
        if(typeof(req.params.password) !== 'string'){
            res.status(400).send({ error: 'Password must be a string.' });
            return;
        }
        // Convert the email to lowercase before searching for it
        var email = req.params.email.toLowerCase();
        Security.find({ email: email }).then(function(securities){
            // No securitiy entries have a matching email
            if(securities.length === 0){
                res.status(400).send('No account with matching email found.');
                throw '';
            }
            // Many security entries exist with matching email, so none of 
            // them have been authenticated
            else if(securities.length > 1){
                res.status(400).send('Email has not yet been authenticated.');
                throw '';
            }
            // The one security entry with matching email has not been authenticated
            else if(securities[0].authentication && !securities[0].passChange){
                res.status(400).send('Email has not yet been authenticated.');
                throw '';
            }
            // If the hash of the password and salt do not match that stored with the security entry
            // with a matching email
            if(cryptoHelper.hash(req.params.password, securities[0].salt) !== securities[0].hashPass){
                res.status(400).send('Invalid password.');
                throw '';
            }
            // Hash of password and salt match the stored hashed password
            else{
                res.send({ security: securities[0] });
            }
        }).catch(function(err){
            if(err){
                res.status(500).send(err);
            }
        });
    });

module.exports = router;