const mongoose 		= require('mongoose');
const express 		= require('express');
const app 			= express();
const bodyParser	= require('body-parser');
const http          = require('http');
const https 		= require('https');
const fs 			= require('fs');
const Environment   = require('./environment');
const key       	= '/etc/letsencrypt/live/joshuaevans.ca/privkey.pem';
const cert      	= '/etc/letsencrypt/live/joshuaevans.ca/fullchain.pem';

mongoose.connect('mongodb://localhost/' + Environment.instance.db, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
}).then(() => {
	// import URL routes for HTTP API
	const accounts = require('./routes/accounts');
	const asks = require('./routes/asks');
	const authenticate = require('./routes/authenticate');
	const bids = require('./routes/bids');
	const portfolios = require('./routes/portfolios');
	const securities = require('./routes/securities');

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

	if (Environment.instance.mode === Environment.modeEnum.PROD) {
		https.createServer({
			key: fs.readFileSync(key),
			cert: fs.readFileSync(cert)
		}, app).listen(Environment.instance.port, () => {
			console.log(`Listening on ${Environment.instance.port} for HTTPS connections`);
		});
	} else if (Environment.instance.mode === Environment.modeEnum.DEV) {
		http.createServer(app).listen(Environment.instance.port, () => {
			console.log(`Listening on ${Environment.instance.port} for HTTP connections`);
		});
	}
}).catch((err) => {
	console.log(err);
});