const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const cryptoHelper = require('../tools/cryptoHelper');
const logErr = require('../tools/logHelper').logErr;
const isValidId = require('../tools/idHelper').isValidId;
const nodemailerHelper = require('../tools/nodemailerHelper');

const Account = require('../models/account');
const Portfolio = require('../models/portfolio');
const Security = require('../models/security');

const ourEmail = 'DMTrade2877@gmail.com';
const ourPass = 'HorseSpongeBikini';
const ourService = 'gmail';

router.route('/')
    // Getting all portfolios for an account
    .get(function(req, res){
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
        if(!isValidId(req.get('security_id'))){
            res.status(400).send('security_id must have valid ID format.');
            return;
        }
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
                res.status(400).send('Please login and fill in your personal'
                    + ' information to finish creating your account.');
                throw '';
            }
            // Find the account associated with the security
            return Account.findById(security.account);
        }).then(function(account){
            // Find all portfolios for the account
            return Portfolio.find({ _id: { $in: account.portfolios } });
        }).then(function(portfolios){
            // Send the portfolio JSONS (containing buys and sells) to the client
            res.send({ portfolios: portfolios });
        }).catch(function(err){
            if(err){
                logErr(err);
                res.status(500).send(err);
            }
        });
    })
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
        // Missing req.body.name for portfolio
        if(!req.body.name || typeof(req.body.name) !== 'string'){
            res.status(400).send('name must be a string.');
            return;
        }
        if(!isValidId(req.get('security_id'))){
            res.status(400).send('security_id must have valid ID format.');
            return;
        }
        var account;
        var portfolio;
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
                res.status(400).send('Please login and fill in your personal'
                    + ' information to finish creating your account.');
                throw '';
            }
            // Find the account associated with the security
            return Account.findById(security.account);
        }).then(function(theAccount){
            account = theAccount;
            return Portfolio.find({ name: req.body.name, account: account._id });
        }).then(function(portfolios){
            // Portfolio belongs to the account with the same name
            if(portfolios.length > 0){
                res.status(400).send('Cannot have portfolios with' +
                ' duplicate names.');
                throw '';
            }
            portfolio = new Portfolio();
            portfolio.account = account._id;
            portfolio.buys = [];
            portfolio.name = req.body.name;
            portfolio.sells = [];
            return portfolio.save();
        }).then(function(){
            account.portfolios.push(portfolio._id);
            return account.save();
        }).then(function(portfolios){
            res.send({ portfolio: portfolio });
        }).catch(function(err){
            if(err){
                logErr(err);
                res.status(500).send(err);
            }
        });
    });

router.route('/:portfolio_id')
    // Remove a portfolio
    .delete(function(req, res){
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
        if(!isValidId(req.get('security_id'))){
            res.status(400).send('security_id must have valid ID format.');
            return;
        }
        if(!isValidId(req.params.portfolio_id)){
            res.status(400).send('portfolio_id must have a valid ID format.');
            return;
        }
        var portfolio;
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
                res.status(400).send('Please login and fill in your personal' +
                ' information to finish creating your account.');
                throw '';
            }
            return Portfolio.findById(req.params.portfolio_id);
        }).then(function(thePortfolio){
            portfolio = thePortfolio;
            // The portfolio exists
            if(portfolio){
                return portfolio.remove().then(function(){
                    return Account.findById(portfolio.account);
                }).then(function(account){
                    var index = account.portfolios.indexOf(portfolio._id);
                    account.portfolios.splice(index, 1);
                    return account.save();
                }).catch(function(err){
                    throw err;
                });
            }
        }).then(function(){
            res.send({ portfolio: portfolio });
        }).catch(function(err){
            if(err){
                logErr(err);
                res.status(500).send(err);
            }
        });
    })
    // Get a single portfolio
    .get(function(req, res){
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
        if(!isValidId(req.get('security_id'))){
            res.status(400).send('security_id must have valid ID format.');
            return;
        }
        if(!isValidId(req.params.portfolio_id)){
            res.status(400).send('portfolio_id must have a valid ID format.');
            return;
        }

        var account;

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
                res.status(400).send('Please login and fill in your personal'
                    + ' information to finish creating your account.');
                throw '';
            }
            // Find the account associated with the security
            return Account.findById(security.account);
        }).then(function(theAccount){
            account = theAccount;
            return Portfolio.findById(req.params.portfolio_id);
        }).then(function(portfolio){
            // No portfolio with that _id exists
            if(portfolio == null){
                res.status(400).send('Invalid portfolio_id.');
            }
            // Check if the portfolio belongs to the account
            for(let i = 0; i < account.portfolios.length; i++){
                if(account.portfolios[i]._id.equals(portfolio._id)){
                    res.send({ portfolio: portfolio });
                    return;
                }
            }

            res.status(400).send('Portfolio does not belong to the account.');
        }).catch(function(err){
            if(err){
                logErr(err);
                res.status(500).send(err);
            }
        });
    })
    // Changing information about a portfolio
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
        // Missing req.body.name for portfolio
        if(!req.body.name || typeof(req.body.name) !== 'string'){
            res.send({ error: 'name must be a string.' });
            return;
        }
        var portfolio;
        Security.findById(req.get('security_id')).then(function(security){
            if(!security){
                throw 'Invalid security_id';
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
            return Portfolio.findById(req.params.portfolio_id);
        }).then(function(thePortfolio){
            portfolio = thePortfolio;
            if(!portfolio){
                throw 'Invalid portfolio_id.';
            }
            // Find any portfolios under the same account with the same
            // name as req.body.name (not including this portfolio)
            return Portfolio.find({ name: req.body.name,
                account: portfolio.account,
                _id: { $ne: portfolio._id } });
        }).then(function(portfolios){
            if(portfolios){
                throw 'Cannot have portfolios with duplicate names.';
            }
            portfolio.name = req.body.name;
            return portfolio.save();
        }).then(function(){
            res.send({ message: 'Portfolio updated.' });
        }).catch(function(err){
            logErr(err);
            res.send({ error: err });
        });
    });

    module.exports = router;