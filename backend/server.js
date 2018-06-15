var mongoose = require('mongoose');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// import URL routes for HTTP API
// var posts = require('./routes/posts');

// middleware for testing, allowing full access to API from anywhere
app.use(function(req, res, next) {
	// allow our page to query the API
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Methods', 'POST, PATCH, GET, PUT, DELETE, OPTIONS');
	next();
});

// use Express to handle our HTTP routes
//app.use('/posts, posts');

// connect to MongoDB using mongoose
mongoose.connect('mongodb://localhost/startUp', { useMongoClient: true });

app.listen(8080, function() {
	console.log('Server listening on localhost:8080');
});