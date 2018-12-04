var mongoose = require('mongoose');

var PortfolioSchema = mongoose.Schema(
    {
        account: {type: mongoose.Schema.ObjectId, ref: 'Accounts'},
        bidSymbols: [{
            symbol: String,         // stock symbol sold
            bids: [{
                price: Number,      //price that the shares were each bought for
                quantity: Number,   // how many shares were purchased
                symbol: String,     // stock symbol purchased
                timeStamp: Date     // when the purchase occurred
            }]
        }],
        askSymbols: [{
            symbol: String,         // stock symbol sold
            asks: [{
                price: Number,      // price that the shares were sold for
                quantity: Number,   // how many shares were sold
                symbol: String,     // stock symbol sold
                timeStamp: Date     // when the sale occurred
            }]
        }],
        name: String                // name of the portfolio
    }
); 

var Portfolio = mongoose.model('portfolio', PortfolioSchema);
module.exports = Portfolio;