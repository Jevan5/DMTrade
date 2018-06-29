var mongoose = require('mongoose');

var securitySchema = mongoose.Schema(
    {
        account: {type: mongoose.Schema.ObjectId, ref: 'Accounts'}, // link to Account
        authentication: String,                                     // authentication code sent by email to confirm email
        authenticationSalt: String,                                 // salt for authentication hashing security
        email: String,                                              // email for communication and authentication
        hashPass: String,                                           // hash(password + salt)
        passChange: Boolean,                                        // true if password is awaiting reset
        passSalt: String                                            // salt for password hashing security
    }
);

var Security = mongoose.model('security', securitySchema);
model.Exports = Security;