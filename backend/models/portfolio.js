var mongoose = require('mongoose');

var PortfolioSchema = mongoose.Schema(
    {
        account: {type: mongoose.Schema.ObjectId, ref: 'Accounts'},
        buys: [{
            price: Number,      // price that the shares were each bought for
            quantity: Number,   // how many shares were purchased
            symbol: String,     // stock symbol purchased
            timeStamp: Date,    // when the purchase occurred
            remaining: Number   // how many of these shares have not yet been sold
        }],
        name: String,
        sells: [{
            price: Number,      // price that the shares were sold for
            quantity: Number,   // how many shares were sold
            symbol: String,     // stock symbol sold
            timeStamp: Date     // when the sale occurred
        }]
    }
);

var Portfolio = mongoose.model('portfolio', PortfolioSchema);
module.exports = Portfolio;