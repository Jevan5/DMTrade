var mongoose = require('mongoose');

const tradeFormat = {
    price: Number,
    quantity: Number,
    symbol: String,
    timeStamp: Date
};

var PortfolioSchema = mongoose.Schema(
    {
        account: {type: mongoose.Schema.ObjectId, ref: 'Accounts'},
        buys: [tradeFormat],
        name: String,
        sells: [tradeFormat]
    }
);

var Portfolio = mongoose.model('portfolio', PortfolioSchema);
module.exports = Portfolio;