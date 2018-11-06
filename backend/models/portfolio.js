var mongoose = require('mongoose');

var PortfolioSchema = mongoose.Schema(
    {
        account: {type: mongoose.Schema.ObjectId, ref: 'Accounts'},
        bids: [{
            price: Number,      // price that the shares were each bought for
            quantity: Number,   // how many shares were purchased
            symbol: String,     // stock symbol purchased
            timeStamp: Date,    // when the purchase occurred
            remaining: Number,  // how many of these shares have not yet been sold
            soldFor: Number     // how much money has been returned from selling this stock back
        }],
        name: String,
        asks: [{
            price: Number,      // price that the shares were sold for
            quantity: Number,   // how many shares were sold
            symbol: String,     // stock symbol sold
            timeStamp: Date,    // when the sale occurred
            boughtFor: Number   // how much money was spent on these stocks to acquire them before selling them
        }]
    }
); 

var Portfolio = mongoose.model('portfolio', PortfolioSchema);
module.exports = Portfolio;