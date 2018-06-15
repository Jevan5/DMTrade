var mongoose = require('mongoose');

var tradeSchema = mongoose.Schema(
    {
        amount: Number,
        isBuy: Boolean,
        portfolio: {type: mongoose.Schema.ObjectId, ref: 'Portfolios'},
        price: Number,
        symbol: String,
        timeStamp: Date
    }
);

var Trade = mongoose.model('trade', tradeSchema);
model.Exports = Trade;