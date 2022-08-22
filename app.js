let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let hbs=require('express-handlebars')
let usersRouter = require('./routes/users');
let adminRouter = require('./routes/admin');
let vendorRouter =require('./routes/vendor')
let session = require('express-session')
let db=require('./config/connections')
let nocache=require('nocache')
let app = express();
let fileUpload=require('express-fileupload')


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({
  helpers:{
    inc:(value)=>{
      return parseInt(value)+1;
    }
  },
  extname:'hbs',layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials/'}))
 // extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views',partialsDir:__dirname+'/views/partials/'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'key', resave:false,saveUninitialized:true,cookie:{maxAge:600000}}))
app.use(nocache())
app.use(fileUpload())

app.use('/', usersRouter);
app.use('/admin', adminRouter);
app.use('/vendor', vendorRouter);
db.connect((err=>{
  if(err) console.log('connection error'+err);
  else console.log("database connected");
}))



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
