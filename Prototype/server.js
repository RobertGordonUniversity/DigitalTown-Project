var express = require('express');
var app = express();
// var d3 = require('d3');


//Database Connection
const database = require('./database');
const connectDB = database.connectDB;


//Database Serverside Routes
const populateRoute = require('./routes/databasePopulator');
const getRoute = require('./routes/getRecords');


// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static('Public'));

// app.use(express.static('client_js'));
// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
  res.render('pages/home.ejs');
});

// login page
app.get('/login', function(req, res) {
  res.render('pages/login.ejs');
});

// register page
app.get('/register', function(req, res) {
  res.render('pages/register.ejs');
});

// map page
app.get('/map', function(req, res) {
  res.render('pages/2dMap.ejs');
});

app.get('/databaseTest', function(req, res) {
  res.render('pages/databaseTest.ejs');
});
app.get('/test', function(req, res) {
  res.render('pages/test.ejs');
});


//Code to send the api calls to the proper serverside code
app.use('/api/populate', populateRoute);
app.use('/api/get', getRoute);


//Runs the connection to the Database
connectDB();


app.listen(8080);
console.log('Server is listening on port 8080');