var mongoose = require('mongoose');

var portfolioSchema = mongoose.Schema(
    {
        account: {type: mongoose.Schema.ObjectId, ref: 'Accounts'},
        name: String,
        trades: [{type: mongoose.Schema.ObjectId, ref: 'Trades'}]
    }
);

var Portfolio = mongoose.model('portfolio', PortfolioSchema);
exports.Model = Portfolio;