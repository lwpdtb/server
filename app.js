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
var jq
// const MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');

mongoose.Promise = global.Promise;
// var db = mongoskin.db("mongodb://localhost:27017/Database",{safe:true});
var options = {  
  auto_reconnect: true,
  poolSize: 10
};
let socketId='';

mongoose.connect('mongodb://127.0.0.1:27017/Database', options, function(err, res) {  
  if(err) {
    console.log('[mongoose log] Error connecting to: ' + 'Database' + '. ' + err);
  } else {
    console.log('[mongoose log] Successfully connected to: ' + 'Database');
  }
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongoose connection error:'));
db.once('open', function callback () {
  // yay!
	console.log('mongoose open success');
});

let user = new mongoose.Schema({
  username:{type:String},
  password:{type:String},
  nickname:{type:String,default:""},
  phone:{type:String,default:""},
  Mac_address:{type:String,default:""},//默认值
  Email:{type:String,default:""},//默认值
  Socket_id:{type:String,default:''},//默认值
  Head_img:{type:String,default:""},//默认值
  User_status:{type:Number,default:0},//默认值
  Friend_list:{type:Array,default:[]},//默认值
  Update_time:{type:Date}
});

var User = mongoose.model('users', user);

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});


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



var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5000');//自定义中间件，设置跨域需要的响应头。
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'x-custom');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  
  next();
 };
 app.use(allowCrossDomain);//运用跨域的中间件

app.get('/', function(req, res, next) {  
  res.send('Select a collection, e.g., /collections/messages')  
  }) 

  app.get('/api/v1.0/:collectionName', function(req, res) {
    // console.log(req)
    req.collection.find({},{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
      if (e) 
      res.send(results)
    })
  })

  app.get('/api/v1.0/:collectionName/:id', function(req, res) {
    req.collection.findOne({_id: req.collection.id(req.params.id)}, function(e, result){
      if (e) 
      res.send(result)
    })
  })

app.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName)
  return next()
}) 


app.post('/collections/:collectionName', function(req, res, next) {  
  req.collection.insert(req.body, {}, function(e, results){  
  if (e) return next(e)
  console.log(results)  
  res.send(results)  
  })  
  }) 


  app.post('/login', function(req, res) {
    let nowtime=(new Date()).getTime()    
    User.find({username:req.body.userName,password:req.body.password},{},function(err,result){
      if(err)return handleError(err);
      if(result.length!==0){
          // console.log(result.length)
          var conditions = {username:req.body.userName};  
          var updates = 
          // {$set: {username:'1'}}
          {$set: {User_status: 1,Socket_id:socketId,Update_time:nowtime}};//将用户名更新为“tiny”  
          User.update(conditions, updates, function (error) {  
              if (error) console.log(error);
                // console.log('成功修改')
                else res.send('ok')
          });  
           
        }else{
          res.send('用户名或者密码错误')
        }
      }
    );

    // var conditions = {username:req.body.userName,password:req.body.password};  
    //       var updates = 
    //       // {$set: {username:'2'}}
    //       {$set: {User_status: 1,Socket_id:socketId,Update_time:nowtime}};//将用户名更新为“tiny”  
    //       User.update(conditions, updates, function (error,Affected) {  
    //           if (error)res.send(error);  
    //           if(Affected.nModified=='1')res.send('ok');
    //           res.send('用户名或者密码错误');
    // });  
  })


  app.post('/register', function(req, res) {
    let nowtime=(new Date()).getTime()
    User.find({username:req.body.username},{nickname:1},function(err,result){
      if(err){
        res.send(err)
      }else if(result.length==0){
        var newuser = {username:req.body.username,_password:req.body.password,Update_time:nowtime};
        // 实例化对象并插入数据
        var monInsert = new User(newuser);
        monInsert.save(function(err){
          if(err){
            res.send(err)
          }else{
            res.send('注册成功')
          }
        });
      }
    });

})


app.get('/send', function(req, res) {
  var smtpTransport = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: "lwpmail@vip.qq.com", 
        pass: "hmumiidngvqjdifb"
    }
});  



var mailOptions = {
  from: 'lwpmail@vip.qq.com',
  to:'2364357112@qq.com',
  subject: '验证码',
  //text: req.body.content,
  html: {path:'./mailHtml.html'}
  
};

smtpTransport.sendMail(mailOptions, (error, info) => {
if (error) {
    return console.log('Error while sending mail: ' + error);
} else {
    console.log('Message sent: %s', info.messageId);
}
res.send('1')

smtpTransport.close();
});  








  // var transporter = nodemailer.createTransport({  
  //   service: 'qq',  
  //   auth: {  
  //     user: '527828938@qq.com',  
  //     pass: 'ugxovfwhvxxxxxx' //授权码,通过QQ获取  
    
  //   }  
  //   });  
  //   var mailOptions = {  
  //     from: '527828938@qq.com', // 发送者  
  //     to: '452076103@qq.com', // 接受者,可以同时发送多个,以逗号隔开  
  //     subject: 'nodemailer2.5.0邮件发送', // 标题  
  //     //text: 'Hello world', // 文本  
  //     html: `<h2>nodemailer基本使用:</h2><h3>  
  //     <a href="http://blog.csdn.net/zzwwjjdj1/article/details/51878392">  
  //     http://blog.csdn.net/zzwwjjdj1/article/details/51878392</a></h3>`   
  //   };  
    
  //   transporter.sendMail(mailOptions, function (err, info) {  
  //     if (err) {  
  //       console.log(err);  
  //       return;  
  //     }  
    
  //     console.log('发送成功');  
  //   });  

})



var numUsers = 0;

// 对于某个用户，可以加入类似"user-" + userId的room，向这个room发送消息，这个用户就会收到这个消息了
// 对于需要可靠聊天的需求，连接后，需要服务端主动推送未收到的聊天，所有聊天都要保存起来，
// 客户端收到后，发送收到的聊天已被接收的消息，数据库再相应修改下状态

io.on('connection', function (socket) {
  console.log(socket.id)
  socketId=socket.id
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
  socket.on('disconnect', function () {
    let nowtime=(new Date()).getTime()        
    socket.broadcast.emit('user left','');
    User.update({Socket_id:socketId}, {Socket_id:'',User_status:0,Update_time:nowtime}, function (error) {  
        if (error) console.log(error);
          console.log('成功退出')
          // else res.send('ok')
    });  

  });
});

module.exports = app;

// module.export = function (app) {
//   app.get( './' , function(res) { 
//       require(index.js)(app)(res);})
// };