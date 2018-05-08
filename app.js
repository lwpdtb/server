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
var multer  = require('multer');
const fs = require('fs');  
const mineType = require('mime-types');  



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
  Socket_id:{type:String,default:""},//默认值
  Head_img:{type:String,default:""},//默认值
  User_status:{type:Number,default:0},//默认值
  Friend_list:{type:Array,default:[]},//默认值
  Update_time:{type:Date},
  Verification:{type:String,default:""}

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
var upload = multer({ dest: 'upload/',encoding:'base64' });


var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5000');//自定义中间件，设置跨域需要的响应头。
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
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
          res.send('Username or password error')
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
        console.log(req.body)
          let nowtime=(new Date()).getTime()
          User.find({username:req.body.username},{},function(err,result){
            if(err){
              res.send(err)
            }else if(result.length==0){
              var newuser = {username:req.body.username,password:req.body._password,Update_time:nowtime,nickname:req.body.nickname,phone:req.body.phone};
              // 实例化对象并插入数据
              var monInsert = new User(newuser);
              monInsert.save(function(err){
                if(err){
                  res.send(err)
                }else{
                  res.send('Success')
                }
              });
            }else{
              res.status(404).send('Already has this user')              
            }
          });

      })


      app.post('/send', function(req, res) {
        var smtpTransport = nodemailer.createTransport({
          service: 'qq',
          auth: {
              user: "lwpmail@vip.qq.com", 
              pass: "hmumiidngvqjdifb"
          }
      });  


      User.find({username:req.body.text_username},{},function(err,result){
        if(err){
          res.send(err)
        }else if(result.length==0){
          res.status(404).send('Wrong username')              
        }else if(result[0].Email==''){
          // console.log(result[0].Email)
          res.status(404).send('You should contact the administrator')   
        }else{
          // console.log(result)
          // res.send(result[0].Email)

          var  x="0123456789qwertyuioplkjhgfdsazxcvbnm";
          var  tmp="";
          var timestamp = new Date().getTime();
          for(var  i=0;i<6;i++)  {tmp  +=  x.charAt(Math.ceil(Math.random()*100000000)%x.length);}
          console.log(tmp)
          var mailOptions = {
            from: 'lwpmail@vip.qq.com',
            to:'\''+result[0].Email+'\'',
            subject: '验证码:'+tmp+'',
            //text: req.body.content,
            html: 
            // {
            //   // path:'./mailHtml.html'
              
            // }
            '<!DOCTYPE html><html><head><meta charset="UTF-8"><style></style><style>html,body{margin:0;padding:0;background:#f1deb9}.tiles{width:750px;height:450px;perspective:1000px}.col{position:relative;float:left;margin:6px;width:calc(150px - 12px);height:calc(150px - 12px)}.col a{position:absolute;width:100%;height:100%;z-index:2}.col a:nth-child(1){-webkit-clip-path:polygon(0 0,100% 0,50% 50%);clip-path:polygon(0 0,100% 0,50% 50%)}.col a:nth-child(2){-webkit-clip-path:polygon(100% 0,100% 100%,50% 50%);clip-path:polygon(100% 0,100% 100%,50% 50%)}.col a:nth-child(3){-webkit-clip-path:polygon(0 100%,50% 50%,100% 100%);clip-path:polygon(0 100%,50% 50%,100% 100%)}.col a:nth-child(4){-webkit-clip-path:polygon(0 0,50% 50%,0 100%);clip-path:polygon(0 0,50% 50%,0 100%)}.col a:hover{z-index:3;-webkit-clip-path:none;clip-path:none}.col a:nth-child(1):hover~.box{transform:rotateX(180deg)}.col a:nth-child(2):hover~.box{transform:rotateY(180deg)}.col a:nth-child(3):hover~.box{transform:rotateX(-180deg)}.col a:nth-child(4):hover~.box{transform:rotateY(-180deg)}.col a:nth-child(1):hover~.box:after,.col a:nth-child(3):hover~.box:after{transform:rotateX(-180deg)}.col a:nth-child(2):hover~.box:after,.col a:nth-child(4):hover~.box:after{transform:rotateY(-180deg)}.col .box{position:absolute;width:100%;height:100%;font-family:"Open Sans",sans-serif;box-shadow:0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12);transform-style:preserve-3d;transition:transform .3s ease-in-out}.col .box:before{content:"";position:absolute;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#FFF;font-size:40px;border-radius:2px;z-index:2;backface-visibility:hidden}.col .box:after{content:"'+tmp+'";position:absolute;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#333;color:#FFF;font-size:48px;border-radius:2px;transition-delay:.15s}.col:nth-child(1) .box:before{content:"";background:#3f51b5}.col:nth-child(1) .box:after{background:#3f51b5}</style></head><body><div class="tiles"><div class="col"><a href="#"></a> <a href="#"></a> <a href="#"></a> <a href="#"></a><div class="box"></div></div></div></body></html>'
            
          };

          smtpTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
                // console.log('Error while sending mail: ' + error);
                // console.log(req)
                res.status(404).send(error)
            } else {
              res.send('success send') 
              User.update({username:req.body.text_username}, {Verification:tmp,Update_time:timestamp}, function (error) {  
                  if (error) console.log(error);
                    // else res.send('ok')
              });   
            }
      
      
            smtpTransport.close();
            });  
        
        }
      });
      })



      app.post('/resetPassword', function(req, res) {
        var timestamp = new Date().getTime();
        User.update({Verification:req.body.Verification}, {Verification:'',password:req.body.new_password,Update_time:timestamp}, function (error,Affected) { 
          // console.log(Affected) 
          if (error) res.status(404).send(error);console.log(error);
          if(Affected.nModified=='1')res.send('ok');
          if(Affected.nModified=='0')res.status(404).send('wrong verification code');
              // else res.send('ok')
        }); 

      })

      app.get('/getBaseinformation', function(req, res) {
        console.log(req.body)
          let nowtime=(new Date()).getTime()
          User.find({Socket_id:socketId},{},function(err,result){
            if(err){
              res.send(err)
            }else if(result.length==0){
              res.status(404).send('Bad Net,please reload')              
            }else{

              let filePath = path.resolve(result[0].Head_img);  
                
              let data = fs.readFileSync(filePath);  
              data = new Buffer(data).toString('base64');  
                
              let base64 = 'data:image/jpeg;base64,' + data;  
              result[0].Head_img=base64
              res.send(result[0])  
              
              
            }
          });

      })
      


      app.post('/uploadHeadImg',upload.single('file'),function(req, res) {
        var timestamp = new Date().getTime();
        console.log(req.file)
        if(req.file.path!==null&&req.file.path!==''&&req.file.path!==undefined){
          User.update({Socket_id:socketId}, {Update_time:timestamp,Head_img:req.file.path}, function (error,Affected) {  
            if (error)console.log(error);
            if(Affected.nModified=='1')res.send('ok');
            if(Affected.nModified=='0')res.status(404).send('upload faild');
              // else res.send('ok')
        }); 
        }else{
         res.status(404).send('upload faild'); 
        }
        

      })


      


var numUsers = 0;

// 对于某个用户，可以加入类似"user-" + userId的room，向这个room发送消息，这个用户就会收到这个消息了
// 对于需要可靠聊天的需求，连接后，需要服务端主动推送未收到的聊天，所有聊天都要保存起来，
// 客户端收到后，发送收到的聊天已被接收的消息，数据库再相应修改下状态

io.on('connection', function (socket) {
  io.sockets.emit('new', 'data');
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
    User.update({Socket_id:socketId}, {Socket_id:'',User_status:0,Update_time:nowtime}, function (error,Affected) {  
        if (error)console.log(error);
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