var mongoose = require('mongoose');

var securitySchema = mongoose.Schema(
    {
        account: {type: mongoose.Schema.ObjectId, ref: 'Accounts'},
        hashPass: String,
        salt: String,
        token: String
    }
);

var Security = mongoose.model('security', securitySchema);
model.Exports = Security;