const crypto = require('crypto');

var createSalt = function(length){
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0, length);
}

var hash = function(plainText, salt){
    var hashed = crypto.createHmac('sha512', salt);
    hashed.update(plainText);
    return hashed.digest('hex');
}

module.exports = {
    createSalt: createSalt,
    hash: hash
}