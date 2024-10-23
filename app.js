var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
// const session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var bookRoutes = require('./routes/book');

var app = express();

// app.use(session({
//   secret: 'secret',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { 
//     secure: false,
//     maxAge: 1000 * 60 * 60 * 24 // 1 day
//   }
// }))

// mongoose.connect('mongodb://localhost/bookstore', { useNewUrlParser: true, useUnifiedTopology: true });

const corsOptions = {
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://week6-express.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}

app.use(cors(corsOptions));

// middleware body parser
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-KEY');
  next();
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser('rahasia123'));
app.use(express.static(path.join(__dirname, 'public')));
const myLogger = function (req, res, next) {
  console.log('LOGGED')
  next()
}

app.use(myLogger)
// upload folder
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}


// define storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

// initialize multer with storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  }
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', bookRoutes);
app.post('/upload', upload.array('photos', 5), (req, res) => {
  console.log(req)

  if(req.files.length === 0){
    return res.status(400).send('No file uploaded')
  }

  const uploadedFiles = req.files.map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype
  }))

  res.json({
    message: `${uploadedFiles.length} files uploaded`,
    files: uploadedFiles
  })
})

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
