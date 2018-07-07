var mongoose = require('mongoose');

var securitySchema = mongoose.Schema(
    {
        account: {type: mongoose.Schema.ObjectId, ref: 'Accounts'}, // link to Account
        authentication: String,                                     // authentication code sent by email to confirm email
        email: String,                                              // email for communication and authentication
        hashPass: String,                                           // hash(password + salt)
        passChange: String,                                         // Non-empty hashed password (password + salt) if requested to be changed
        salt: String                                                // salt for password hashing security
    }
);

var Security = mongoose.model('security', securitySchema);
module.exports = Security;

/*
                    MEANING BEHIND AUTHENTICATION AND PASSCHANGE

    | ================= | ============= | ================================= |
    |   authentication  |   passChange  |               meaning             |
    | ================= | ============= | ================================= |
    |       empty       |   empty       | Account is authenticated, and     |
    |                   |               | there is no pending password      |
    |                   |               | change.                           |
    | ----------------- | ------------- | --------------------------------- |
    |       empty       |   non-empty   | INVALID. If a password change is  |
    |                   |               | pending, there must be an         |
    |                   |               | authentication code to confirm    |
    |                   |               | the change via email.             |
    | ----------------- | ------------- | --------------------------------- |
    |   non-empty       |   empty       | Account is not yet authenticated. |
    | ----------------- | ------------- | --------------------------------- |
    |   non-empty       |   non-empty   | Account is authenticated, and     |
    |                   |               | there is a pending password       |
    |                   |               | change.                           |
    | ----------------- | ------------- | --------------------------------- |
*/