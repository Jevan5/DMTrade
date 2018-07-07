const crypto = require('crypto');
const express = require('express');
const router = express.Router();

const Account = require('../models/account');
const Security = require('../models/security');
const Trade = require('../models/trade');

var checkCreds = function(security_id, hashPass){
    // Format of security_id must be a string
    if(!security_id || typeof(security_id) !== 'string'){
        throw 'Improper security_id format.';
    }
    // Format of hashPass must be a string
    if(!hashPass || typeof(hashPass) !== 'string'){
        throw 'Improper hashPass format.';
    }
    return Security.findById(security_id);
}

module.exports = {
    checkCreds: checkCreds
}