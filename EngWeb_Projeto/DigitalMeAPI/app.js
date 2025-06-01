var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')

const {v4 : uuidv4} = require('uuid')
var session = require('express-session')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy


var mongoDB = 'mongodb://digitalme-mongo:27017/digitalme';
mongoose.connect(mongoDB);
var connection = mongoose.connection
connection.on('error', console.error.bind(console, 'Erro na conexão ao mongoDB'));
connection.once('open', () => console.log('Conexão realizada com sucesso'));

//passport config
var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var aipRouter = require('./routes/aip');
var userRouter = require('./routes/user');

var app = express();

app.use(session({
  genid: req => {
    return uuidv4();
  },
  secret: 'digitalMeKey',
  resave: false,
  saveUninitialized: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/aip', aipRouter);
app.use('/user', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
