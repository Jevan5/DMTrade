const crypto = require('crypto');
const express = require('express');
const router = express.Router();

const Accounts = require('models/account');
const Securities = require('models/security');
const Trades = require('models/trade');

function checkToken(token){
    // 'Id-Token' header is missing, is not a string, or is less than 24 char
    if(!token || typeof(token) !== 'string' ||
        token.length < 24){
            return {
                error: 'Properly formatted token header ' +
                    'is required.'
            }
    }
    var id = token.substring(0, 24);
    var pass = token.substring(24);

    var security;

    return Securities.findById(id).then(function(theSecurity, err){
        if(err){
            return { error: err };
        } else if(!theSecurity){
            return { error: 'Invalid _id in token.' };
        } else{
            security = theSecurity;
            const hash = crypto.createHash('sha256');
            hash.update(pass + ecurity.salt);
            const hashPass = hash.digest('binary');
            if(hashPass === security.hashPass){
                return Accounts.findById(security.account);
            } else{
                return { error: 'Incorrect password.' };
            }
        }
    }).then(function(security, err){
        // Error was caught above
        if(security.error){
            return { error: security.error };
        } else if(err){
            return { error: err };
        } else{
            return {
                account: account,
                security: security
            }
        }
    });
}

module.exports = {
    checkToken: checkToken
}