var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var http = require('http').Server(app);
const io = require('socket.io')(server)
var port = process.env.PORT || 4000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

var index = require('./routes/index');
var users = require('./routes/users');
var mongoose = require('mongoose');
var Kittens=require('./Schema/kittens');
mongoose.connect('mongodb://localhost/test');


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
  console.log('成功连接数据库');
});

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.get('/new', function(req, res){
  res.sendFile(__dirname + '/new.html');
  });
app.get('/jmh', function (req, res) {
  // console.log(req,res);
  // res.send(silence.name);
  

// // NOTE: methods must be added to the schema before compiling it with mongoose.model()
// kittySchema.methods.speak = function () {
//   var greeting = this.name
//   ? "Meow name is " + this.name
//   : "I don't have a name";
//   console.log(greeting);
// }


// // Kitten.speak();


// var fluffy = new Kitten({ name: 'fluff' });
// fluffy.speak();


Kittens.find({name:'fluffy',psw:'123456'},function (err, kittens) {

if (err) return console.error(err);
console.log(kittens);
})
}); 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

var numUsers = 0;



io.on('connection', function (socket) {
  // 当客户端发出“new message”时，服务端监听到并执行相关代码
  socket.on('new message', function (data) {
      // 广播给用户执行“new message”   
      console.log(data)
      io.sockets.emit('new message', data);
  });
  
  // 当客户端发出“add user”时，服务端监听到并执行相关代码
  // socket.on('add user', function (username) {
  //     socket.username = username;
  //     //服务端告诉当前用户执行'login'指令
  //     socket.emit('login', {});
  // });
  
  // 当用户断开时执行此指令
  socket.on('disconnect', function () {});
});

module.exports = app;
