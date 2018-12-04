const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const cryptoHelper = require('../tools/cryptoHelper');
const logErr = require('../tools/logHelper').logErr;
const isValidId = require('../tools/idHelper').isValidId;
const nodemailerHelper = require('../tools/nodemailerHelper');

const Account = require('../models/account');
const Security = require('../models/security');
const Portfolio = require('../models/portfolio');

router.route('')
    // Placing a bid
    .post(function(req, res) {
        // Improper security_id header format
        if(!req.get('security_id') || typeof(req.get('security_id')) !== 'string'){
            res.status(400).send('security_id header must be a string.');
            return;
        }
        // Improper hashPass header format
        if(!req.get('hashPass') || typeof(req.get('hashPass')) !== 'string'){
            res.status(400).send('hashPass header must be a string.');
            return;
        }
        // Improper price format for trade
        if(!req.body.price || typeof(req.body.price) !== 'number' || isNaN(req.body.price)){
            res.status(400).send('price must be a number.');
            return;
        }
        // Improper quantity format for trade
        if(!req.body.quantity || typeof(req.body.quantity) !== 'number'
            || req.body.quantity <= 0 || isNaN(req.body.quantity)){
            res.status(400).send('quantity must be a positive non-zero number.');
            return;
        }
        // Improper symbol format for trade
        if(!req.body.symbol || typeof(req.body.symbol) !== 'string'){
            res.status(400).send('symbol must be a string.');
            return;
        }
        if(!isValidId(req.get('security_id'))){
            res.status(400).send('security_id must have valid ID format.');
            return;
        }
        if(!isValidId(req.body.portfolio)){
            res.status(400).send('portfolio must have valid ID format.');
            return;
        }

        // Convert the symbol to all caps
        req.body.symbol = req.body.symbol.toUpperCase();

        var bid;

        Security.findById(req.get('security_id')).then(function(security){
            if(!security){
                res.status(400).send('Invalid security_id.');
                throw '';
            }
            // Account is not authenticated
            if(security.authentication && !security.passChange){
                res.status(400).send('Email has not been authenticated.');
                throw '';
            }
            // User has not filled in personal information for account yet,
            // so account has not been created yet
            if(!security.account){
                res.status(400).send('Please login and fill in your' +
                    ' personal information to finish creating your account.');
                throw '';
            }
            // Find the account associated with the security
            return Account.findById(security.account);
        }).then(function(account){
            // Find index of the portfolio in the account they're trying to access
            var index = account.portfolios.indexOf(req.body.portfolio);
            if(index < 0){
                res.status(400).send('You do not have permission to access this portfolio.');
                throw '';
            }
            return Portfolio.findById(req.body.portfolio);
        }).then(function(portfolio){
            bid = {
                price: Math.round(req.body.price * 100) / 100,
                quantity: req.body.quantity,
                symbol: req.body.symbol,
                timeStamp: new Date()
            };
            // Look for the symbol in the list of bidSymbols of the portfolio
            let found = false;
            for (let i = 0; i < portfolio.bidSymbols.length; i++) {
                let bidSymbol = portfolio.bidSymbols[i];
                if (bidSymbol.symbol === req.body.symbol) {
                    bidSymbol.bids.push(bid);
                    found = true;
                    break;
                }
            }

            if (!found) {
                portfolio.bidSymbols.push({
                    symbol: req.body.symbol,
                    bids: [bid]
                });
            }

            return portfolio.save();
        }).then(function(){
            res.send({ bid: bid });
        }).catch(function(err) {
            if (err) {
                logErr(err);
                res.status(500).send(err);
            }
        })
    });

module.exports = router;