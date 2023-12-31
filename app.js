require('dotenv').config({})
var createError = require('http-errors');
var express = require('express');
var app = express();
var path = require('path');
var logger = require('morgan');
const cors = require('cors');
const corsOptions = {
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200
}

app.use(cors(corsOptions));

var indexRouter = require('./router/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/uploads/')));
app.use('/uploads', express.static('uploads'));

// app.use(expressLayout);

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_TYPES") {
    res.status(422).json({ error: "only image " })
  }
});

const port = 3001
// const host = process.env.host

app.listen(port, () => {
  console.log(`Server running on port : ${port}`)
});

module.exports = app;
