var mongoose = require('mongoose');

var accountSchema = mongoose.Schema(
    {
        email: String,
        firstName: String,
        lastName: String,
        portfolios: [{type: mongoose.Schema.ObjectId, ref: 'Portfolios'}],
        security: {type: mongoose.Schema.ObjectId, ref: 'Securities'}
    }
);

var Account = mongoose.model('account', accountSchema);
exports.Model = Account;