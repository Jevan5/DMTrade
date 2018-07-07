const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const cryptoHelper = require('../tools/cryptoHelper');
const nodemailerHelper = require('../tools/nodemailerHelper');

const Account = require('../models/account');
const Security = require('../models/security');

router.route('/email/:security_id/:authentication')
    // Authenticating an email
    .get(function(req, res){
        // Check format of parameters
        if(typeof(req.params.security_id) !== 'string' || typeof(req.params.authentication) !== 'string'){
            res.send({ error: 'security_id and authentication must be strings.' });
            return;
        }
        var security;
        Security.findById(req.params.security_id).then(function(theSecurity){
            security = theSecurity;
            if(!security){
                throw req.params.security_id + ' does not match any entries.';
            }
            else{
                if(security.authentication === ''){
                    res.send({ message: security.email + ' has already been authenticated.' });
                    return;
                }
                var hashedAuth = cryptoHelper.hash(req.params.authentication, security.salt);
                if(hashedAuth !== security.authentication){
                    throw 'Invalid authentication code.';
                }
                security.authentication = '';
                return security.save();
            }
        }).then(function(){
            // Remove all security entries with matching email, that also aren't authenticated
            return Security.deleteMany({ email: security.email, authentication: { $ne: '' }});
        }).then(function(){
            res.send({ message: security.email + ' has been authenticated.' });
        }).catch(function(err){
            res.send({ error: err });
        });
    });

router.route('/passwordChange/:security_id/:authentication')
    // Authenticating a password change
    .get(function(req, res){
        // Check format of parameters
        if(typeof(req.params.security_id) !== 'string' || typeof(req.params.authentication) !== 'string'){
            res.send({ error: 'security_id and authentication must be strings.' });
            return;
        }
        var security;
        Security.findById(req.params.security_id).then(function(theSecurity){
            if(!theSecurity){
                throw 'Invalid security_id.';
            }
            if(!security.passChange){
                throw 'No pending password change.';
            }
            var hashedAuth = cryptoHelper.hash(req.params.authentication, security.salt);
            if(hashedAuth !== theSecurity.authentication){
                throw 'Invalid authentication code.';
            }
            
            security = theSecurity;
        }).catch(function(err){
            res.send({ error: err });
        })
    })

module.exports = router;