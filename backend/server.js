const mongoose = require('mongoose');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// import URL routes for HTTP API
var accounts = require('./routes/accounts');
var authenticate = require('./routes/authenticate');
var portfolios = require('./routes/portfolios');
var securities = require('./routes/securities');
var trades = require('./routes/trades');

// Parses application/json format
app.use(bodyParser.json());

// Parses application/x-www-form-urlencoded format
app.use(bodyParser.urlencoded({ extended: true }));

// middleware for testing, allowing full access to API from anywhere
app.use(function(req, res, next) {
	// allow our page to query the API
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:4200');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, security_id, hashPass', 'Access');
	res.setHeader('Access-Control-Allow-Methods', 'POST, PATCH, GET, PUT, DELETE, OPTIONS');
	next();
});

// use Express to handle our HTTP routes
app.use('/accounts', accounts);
app.use('/authenticate', authenticate);
app.use('/portfolios', portfolios);
app.use('/securities', securities);
app.use('/trades', trades);

// connect to MongoDB using mongoose
mongoose.connect('mongodb://localhost/startUp');

app.listen(8080, function() {
	console.log('Server listening on localhost:8080');
});