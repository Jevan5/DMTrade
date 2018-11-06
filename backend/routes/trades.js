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

const ourEmail = 'DMTrade2877@gmail.com';
const ourPass = 'HorseSpongeBikini';
const ourService = 'gmail';

router.route('/:portfolio_id')
    // Bidding or asking
    .post(function(req, res){
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
        if(!req.body.price || typeof(req.body.price) !== 'number'){
            res.status(400).send('price must be a number.');
            return;
        }
        // Improper quantity format for trade
        if(!req.body.quantity || typeof(req.body.quantity) !== 'number'
            || req.body.quantity <= 0){
            res.status(400).send('quantity must be a positive non-zero number.');
            return;
        }
        // Improper symbol format for trade
        if(!req.body.symbol || typeof(req.body.symbol) !== 'string'){
            res.status(400).send('symbol must be a string.');
            return;
        }
        // Improper action format for trade
        if(!req.body.action || typeof(req.body.symbol) !== 'string'
            || (req.body.action !== 'bid'
            && req.body.action !== 'ask')){
            res.status(400).send("action must be 'bid' or 'ask'.");
            return;
        }
        if(!isValidId(req.get('security_id'))){
            res.status(400).send('security_id must have valid ID format.');
            return;
        }
        if(!isValidId(req.params.portfolio_id)){
            res.status(400).send('portfolio_id must have valid ID format.');
            return;
        }

        // Convert the symbol to all capital letters
        req.body.symbol = req.body.symbol.toUpperCase();

        var trade;

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
            var index = account.portfolios.indexOf(req.params.portfolio_id);
            if(index < 0){
                res.status(400).send('You do not have permission to access this portfolio.');
                throw '';
            }
            return Portfolio.findById(req.params.portfolio_id);
        }).then(function(portfolio){
            trade = {
                price: Math.round(req.body.price * 100) / 100,
                quantity: req.body.quantity,
                symbol: req.body.symbol,
                timeStamp: new Date()
            };
            // Trying to bid
            if(req.body.action === 'bid'){
                trade.remaining = trade.quantity;
                trade.soldFor = 0;
                portfolio.bids.push(trade);
            }
            // Trying to ask
            else{
                trade.boughtFor = 0;
                // How many shares are available to be sold
                let availableToSell = 0;
                let sufficient = true;
                // Iterate over all the bids, in reverse order (don't have to
                // iterate over the entire array most likely)
                for(let i = portfolio.bids.length - 1; i >= 0; i--){
                    // Found an old purchase for the same stock
                    if(portfolio.bids[i].symbol === trade.symbol){
                        // The latest purchase has been sold, meaning
                        // there are no more sales that could be made.
                        // You obviously couldn't find enough
                        if(portfolio.bids[i].remaining === 0){
                            sufficient = false;
                            break;
                        }
                        else{
                            // You've found more shares that you can sell, still
                            // might need more though
                            availableToSell += portfolio.bids[i].remaining;
                            // You've found enough, stop looking
                            if(availableToSell >= trade.quantity){
                                break;
                            }
                        }
                    }
                }
                // Didn't find enough
                if(availableToSell < trade.quantity){
                    sufficient = false;
                }
                if(!sufficient){
                    res.status(400).send('Insufficient shares to make that sale.');
                    throw '';
                }
                // Keep track of how many shares still need to be sold
                // as we update the purchases' 'remaining' attribute
                let remainingToSell = trade.quantity;
                // Iterate over all the bids, in regular order, to sell
                // them in a FIFO matter
                for(let i = 0; i < portfolio.bids.length; i++){
                    let bid = portfolio.bids[i];
                    // Found an old purchase for the same stock
                    if(bid.symbol === trade.symbol){
                        // This purchase has shares to be sold
                        if(bid.remaining > 0){
                            // This purchase can not fulfill the sale. Decrease
                            // the shares remaining to sell to complete the sale,
                            // and set the shares remaining of the purchase to 0
                            if(bid.remaining < remainingToSell){
                                bid.soldFor += bid.remaining * trade.price;
                                trade.boughtFor += bid.remaining * bid.price;
                                remainingToSell -= bid.remaining;
                                bid.remaining = 0;
                            }
                            // This purchase has enough shares to complete the sale.
                            // Decrease the amount of shares remaining of the purchase,
                            // and complete the sale
                            else{
                                bid.soldFor += remainingToSell * trade.price;
                                trade.boughtFor += remainingToSell * bid.price;
                                bid.remaining -= remainingToSell;
                                break;
                            }
                        }
                    }
                }
                portfolio.asks.push(trade);
            }
            return portfolio.save();
        }).then(function(){
            res.send({ trade: trade });
        }).catch(function(err){
            if(err){
                logErr(err);
                res.status(500).send(err);
            }
        });
    });

module.exports = router;