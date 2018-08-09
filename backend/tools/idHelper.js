const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Validates a string to be a potential ObjectId.
// Returns true if id is a valid string. False otherwise.
var isValidId = function(id){
    try{
        var objectId = new mongoose.Types.ObjectId(id);
        return true;
    }
    catch(e){
        return false;
    }
}

module.exports = {
    isValidId: isValidId
}