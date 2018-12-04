const mongoose 		= require('mongoose');
const express 		= require('express');
const app 			= express();
const bodyParser	= require('body-parser');
const https 		= require('https');
const fs 			= require('fs');
const port 			= require('./environments/environment').port;

// import URL routes for HTTP API
var accounts = require('./routes/accounts');
var asks = require('./routes/asks');
var authenticate = require('./routes/authenticate');
var bids = require('./routes/bids');
var portfolios = require('./routes/portfolios');
var securities = require('./routes/securities');

// Parses application/json format
app.use(bodyParser.json());

// Parses application/x-www-form-urlencoded format
app.use(bodyParser.urlencoded({ extended: true }));

// middleware for testing, allowing full access to API from anywhere
app.use(function(req, res, next) {
	// allow our page to query the API
	res.setHeader("Access-Control-Allow-Credentials", true);
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, security_id, hashPass', 'Access');
	res.setHeader('Access-Control-Allow-Methods', 'POST, PATCH, GET, PUT, DELETE, OPTIONS');
	next();
});

// use Express to handle our HTTP routes
app.use('/accounts', accounts);
app.use('/asks', asks);
app.use('/authenticate', authenticate);
app.use('/bids', bids);
app.use('/portfolios', portfolios);
app.use('/securities', securities);

// connect to MongoDB using mongoose
mongoose.connect('mongodb://localhost/startUp');

https.createServer({
	key: fs.readFileSync(""),	// Put private key here
	cert: fs.readFileSync("")	// Put certificate here
}, app).listen(port);
console.log('Server listening on localhost:' + port);