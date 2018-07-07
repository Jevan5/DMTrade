const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const cryptoHelper = require('../tools/cryptoHelper');
const logErr = require('../tools/logHelper').logErr;
const nodemailerHelper = require('../tools/nodemailerHelper');

const Account = require('../models/account');
const Security = require('../models/security');

const ourEmail = 'DMTrade2877@gmail.com';
const ourPass = 'HorseSpongeBikini';
const ourService = 'gmail';

router.route('/:portfolio_id')
    // Buying or selling
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
        // Improper price format for trade
        if(!req.body.price || typeof(req.body.price) !== 'number'){
            res.send({ error: 'price must be a number.' });
            return;
        }
        // Improper quantity format for trade
        if(!req.body.quantity || typeof(req.body.quantity) !== 'number'){
            res.send({ error: 'quantity must be a number.' });
            return;
        }
        // Improper symbol format for trade
        if(!req.body.symbol || typeof(req.body.symbol) !== 'string'){
            res.send({ error: 'symbol must be a string.' });
            return;
        }
        // Improper action format for trade
        if(!req.body.action || (req.body.action !== 'buy' && req.body.action !== 'sell')){
            res.send({ error: 'action must be \'buy\' or \'sell\'.' });
            return;
        }
        Security.findById(req.get('security_id')).then(function(security){
            if(!security){
                throw 'Invalid security_id.';
            }
            // Account is not authenticated
            if(security.authentication && !security.passChange){
                throw 'Email has not been authenticated.';
            }
            // User has not filled in personal information for account yet,
            // so account has not been created yet
            if(!security.account){
                throw 'Please login and fill in your personal information'
                    + ' to finish creating your account.';
            }
            // Find the account associated with the security
            return Account.findById(security.account);
        }).then(function(account){
            // Find index of the portfolio in the account they're trying to access
            var index = account.portfolios.indexOf(req.params.portfolio_id);
            if(index < 0){
                throw 'You do not have permission to access this portfolio.';
            }
            return Portfolio.findById(req.params.portfolio_id);
        }).then(function(portfolio){
            var trade = {
                price: req.body.price,
                quantity: req.body.quantity,
                symbol: req.body.symbol,
                timeStamp: new Date()
            };
            if(req.body.action === 'buy'){
                portfolio.buys.push(trade);
            }
            else{
                portfolio.sells.push(trade);
            }
            return portfolio.save();
        }).then(function(){
            res.send({ message: 'Portfolio updated with new trade.' });
        }).catch(function(err){
            logErr(err);
            res.send({ error: err });
        });
    });

module.exports = router;