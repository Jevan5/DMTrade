const express = require('express');
const router = express.Router();

const cryptoHelper = require('../tools/cryptoHelper');
const logErr = require('../tools/logHelper').logErr;

const Account = require('../models/account');
const Security = require('../models/security');

router.route('/')
    // After logging in, retrieving personal information
    .get(function(req, res){
        // Improper security_id header format
        if(!req.get('security_id') || typeof(req.get('security_id')) !== 'string'){
            res.send({ error: 'security_id header must be a string.' });
            return;
        }
        // Improper hashPass header format
        if(!req.get('hashPass') || typeof(req.get('hashPass')) !== 'string'){
            res.send({ error: 'hashPass header must be a string.' });
            return;
        }
        Security.findById(req.get('security_id')).then(function(security){
            // No matching security
            if(!security){
                throw 'Invalid security_id.';
            }
            // Security entry is not authenticated
            if(security.authentication && !security.hashPass){
                throw 'Email has not been authenticated.';
            }
            if(cryptoHelper.hash(req.get('hashPass'), security.salt) !== security.hashPass){
                throw "Passwords don't match.";
            }
            // User has not filled in personal information for account yet,
            // so account has not been created yet
            if(!security.account){
                throw 'Please login and fill in your personal information'
                + ' to finish creating your account.';
            }
            return Account.findById(security.account);
        }).then(function(account){
            res.send({ account: account });
        }).catch(function(err){
            logErr(err);
            res.send({ error: err });
        });
    })
    // Filling out information after the first login
    .post(function(req, res){
        // Improper security_id header format
        if(!req.get('security_id') || typeof(req.get('security_id')) !== 'string'){
            res.send({ error: 'security_id header must be a string.' });
            return;
        }
        // Improper hashPass header format
        if(!req.get('hashPass') || typeof(req.get('hashPass')) !== 'string'){
            res.send({ error: 'hashPass header must be a string.' });
            return;
        }
        // Improper firstName format
        if(!req.body.firstName || typeof(req.body.firstName) !== 'string'){
            res.send({ error: 'firstName must be a string.' });
            return;
        }
        // Improper lastName format
        if(!req.body.lastName || typeof(req.body.lastName) !== 'string'){
            res.send({ error: 'lastName must be a string.' });
            return;
        }
        var security;
        var account;
        // Find security entry with matching _id
        Security.findById(req.get('security_id')).then(function(theSecurity){
            // No security entry with matching _id === req.get('security_id')
            if(!security){
                throw 'Invalid security_id.';
            }
            var hashPass = cryptoHelper.hash(req.get('hashPass'), security.salt);
            // Invalid hashPass
            if(hashPass !== security.hashPass){
                throw 'Invalid hashPass.';
            }
            security = theSecurity;
            // Create the new account entry
            account = new Account();
            account.firstName = req.body.firstName;
            account.lastName = req.body.lastName;
            account.portfolios = [];
            // Link the new account to the security entry that it's associated with
            account.security = req.get('security_id');
            return account.save();
        }).then(function(){
            // Link the security entry to the new account that it's associated with
            security.account = account._id;
            return security.save();
        }).then(function(){
            res.send({ message: 'Account created.' });
        }).catch(function(err){
            logErr(err);
            res.send({ error: err });
        });
    })
    // Updating personal information
    .put(function(req, res){
        // Improper security_id header format
        if(!req.get('security_id') || typeof(req.get('security_id')) !== 'string'){
            res.send({ error: 'security_id header must be a string.' });
            return;
        }
        // Improper hashPass header format
        if(!req.get('hashPass') || typeof(req.get('hashPass')) !== 'string'){
            res.send({ error: 'hashPass header must be a string.' });
            return;
        }
        Security.findById(req.get('security_id')).then(function(security){
            // No security entry with matching _id === req.get('security_id')
            if(!security){
                throw 'Invalid security_id.';
            }
            var hashPass = cryptoHelper.hash(req.get('hashPass'), security.salt);
            // Invalid hashPass
            if(hashPass !== security.hashPass){
                throw 'Invalid hashPass.';
            }
            // Trying to update firstName
            if(req.body.firstName && typeof(req.body.firstName) === 'string'){
                security.firstName = req.body.firstName;
            }
            // Trying to update lastName
            if(req.body.lastName && typeof(req.body.lastName) === 'string'){
                security.lastName = req.body.lastName;
            }
            return security.save();
        }).then(function(){
            res.send({ message: 'Account updated.' });
        }).catch(function(err){
            logErr(err);
            res.send({ error: err });
        });
    });

module.exports = router;