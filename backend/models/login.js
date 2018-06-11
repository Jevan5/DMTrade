var mongoose = require('mongoose');

var loginSchema = mongoose.Schema(
    {
        email: String,
        nonce: String,
        password: String,
        response: String,
        token: String
    }
);

var Login = mongoose.model('login', loginSchema);
model.Exports = Login;