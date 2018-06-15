var mongoose = require('mongoose');

var loginSchema = mongoose.Schema(
    {
        email: String,
        password: String,
        token: String
    }
);

var Login = mongoose.model('login', loginSchema);
model.Exports = Login;