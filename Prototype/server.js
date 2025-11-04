var express = require('express');
var app = express();
const database = require('./database');
const connectDB = database.connectDB;
// var d3 = require('d3');

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static('Public'));

// app.use(express.static('client_js'));
// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
  res.render('pages/index.ejs');
});

// login page
app.get('/login', function(req, res) {
  res.render('pages/login.ejs');
});

// map page
app.get('/map', function(req, res) {
  res.render('pages/map.ejs');
});
app.get('/2DMap', function(req, res) {
  res.render('pages/2DMap.ejs');
});
app.get('/test', function(req, res) {
  res.render('pages/test.ejs');
});


connectDB();

app.listen(8080);
console.log('Server is listening on port 8080');