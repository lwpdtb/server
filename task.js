// ``
// var userName='jspang';//登录的用户名
// var timeStamp=Date.parse(new Date());
// var jsonDatabase={'loginName':userName,'loginTime':timeStamp};
// var db=connect('log');//use log
// var startTime=(new Date()).getTime();

// for(let i=0;i<10000;i++){
//     db.log.insert({num:i});
// }

// var temparray=[];
// for(let i=0;i<10000;i++){
//     temparray.push({num:i});
// }

// db.log.insert(temparray)

// var runTime=(new Date()).getTime()-startTime;

// print(runTime+'ms');
// C:\MongoDB\bin

// db.login.insert(jsonDatabase);


// var workmate1={
//     name:'japang',
//     age:33,
//     sex:1,
//     job:'前端',
//     skill:{
//         skillone:'html+css',
//         skilltwo:'js',
//         skillthree:'php'
//     },
//     regeditTime:new Date()
// }

// var workmate2={
//     name:'She',
//     age:31,
//     sex:1,
//     job:'后端',
//     skill:{
//         skillone:'html+css',
//         skilltwo:'J2EE',
//         skillthree:'PPT'
//     },
//     regeditTime:new Date()
// }

// var workmate3={
//     name:'nvhai',
//     age:18,
//     sex:2,
//     job:'产品',
//     skill:{
//         skillone:'ps',
//         skilltwo:'UI',
//         skillthree:'ppt'
//     },
//     regeditTime:new Date()
// }


// var db=connect('log');
// var workmate=[workmate1,workmate2,workmate3]

// db.workmate.insert(workmate3)
// db.workmate.update({name:'nvhai'},workmate3)//error!!!!
// db.workmate.update({'name':'nvhai'},{'$set':{sex:4}});      //$set  修改器
// db.workmate.update({'name':'nvhai'},{'$set':{'skill.skillthree':'word'}});      //$set  修改器


// db.workmate.update({'name':'nvhai'},{'$unset':{'skill.skillthree':''}});      //$unset  修改器

// db.workmate.update({'name':'nvhai'},{'$inc':{'age':-2}});                        //$inc    修改器 

//multi
// db.workmate.update({},{'$set':{'interest':[]}},{multi:true})   //multi指查找了一个以后继续查找

// db.workmate.update({'name':'nanhai'},{'$set':{'age':20}},{upsert:true});   //upsert 查找目标进行update，如果有就改，没有就新增

// db.workmate.update({},{$push:{"skill.skillFour":'draw'}},{multi:true})

//$addToSet
// db.workmate.update({},{$addToSet:{"interest":'read'}},{multi:true})

// var newinterest=['sing','dance','code','read']
// db.workmate.update({},{$addToSet:{"interest":{$each:newinterest}}},{multi:true})    //$each

// db.workmate.update({'name':'japang'},{$pop:{"interest":1}})     //1和-1   末尾和头开始‘删除’

// db.workmate.update({'name':'japang'},{$set:{'interest.2':'code'}})     //.number 的形式精准定位



// var resultMessage=db.runCommand({getLastError:1})
// printjson(resultMessage)    //!!


// ========================
//应答试操作   findAndModify
// ========================

// db.workmate.update({sex:4},{$set:{money:1000}},false,true)    //upsert  和  multi


// var myModify={
//     findAndModify:"workmate",
//     query:{name:'japang'},
//     update:{$set:{age:18}},
//     new:true,    //更新完成，需要查看结果，如果为false不进行查看结果
// }
// var ResultMessage=db.runCommand(myModify);
 
// printjson(ResultMessage)


// print("success")


// db.workmate.find(             //find
//     {"skill.skillone":"html+css"},
//     {name:true,"skill.skillone":true}
// )


// db.workmate.find(
//     {age:{$lt:20,$gt:17}},
//     {name:true}
// )



//$in   一个key多个value
//$nin
// db.workmate.find({age:{$nin:[17,18]}},{'_id':0,'name':1})


//$or

// db.workmate.find(
//     {$or:[{age:{$gt:19}},{'skill':'UI'}]}
// )


// $all
// db.workmate.find(
//     {interest:{$all:['read','dance']}},
//     {name:1,_id:0}
// )

// $in
// db.workmate.find(
//     {interest:{$in:['read','dance']}},
//     {name:1,_id:0}
// )

// $size

// db.workmate.find(
//     {interest:{$size:4}},
//     {name:1,_id:0}
// )

// $slice
// db.workmate.find(
//     {interest:{$size:4}},
//     {name:1,_id:0,interest:{$slice:-1}}
// )                                                           //slice 切多少数量出来  负数表示从后开始切


//分页 2    年龄从小到大

// db.workmate.find(
//     {},
//     {name:1,age:1,_id:0}
// ).limit(2).skip(0).sort({age:1})


// $where

// db.workmate.find({$where:"this.age>=30"},
// {name:1,age:1,_id:0})                        //能用类似js的语法进行查询


// var result=db.workmate.find();

// while(result.hasNext()){
//     printjson(result.next())
// }


// result.forEach((n,i)=>{
//     printjson(n);
// })


// function GetRandomNum(min,max){
//     let range=max-min;
//     let rand=Math.random();
//     return (min+Math.round(rand*range));

// }

// function GetRandomUserName(min,max){
//     let tempStringArray="123456789qwertyuiopasdfghjklzxcvbnm".split("");
//     let outputtext="";
//     for(let i=1;i<GetRandomNum(min,max);i++){
//         outputtext=outputtext+tempStringArray[GetRandomNum(0,tempStringArray.length)]
//     }
//     return outputtext;
// }


//插入200W条数据

// var startTime=(new Date()).getTime();
// var tempInfo=[];


// for(let i=0;i<2000000;i++){
//     tempInfo.push({
//         userName:GetRandomUserName(7,16),
//         regeditTime:new Date(),
//         randomNum0:GetRandomNum(100000,999999),
//         randomNum1:GetRandomNum(100000,999999),
//         randomNum2:GetRandomNum(100000,999999),
//         randomNum3:GetRandomNum(100000,999999),
//         randomNum4:GetRandomNum(100000,999999),
//         randomNum5:GetRandomNum(100000,999999),
//         randomNum6:GetRandomNum(100000,999999),
//         randomNum7:GetRandomNum(100000,999999),
//         randomNum8:GetRandomNum(100000,999999),
//         randomNum9:GetRandomNum(100000,999999),
//     }
//     )
// }


// var db=connect('log');
// db.randomInfo.insert(tempInfo);
// var endTime=(new Date()).getTime()-startTime;

// print('执行了'+endTime+'ms');

// console.log(GetRandomUserName(7,16))



// var startTime=(new Date()).getTime();


// var db=connect('log');
// var result=db.randomInfo.find({'userName':'tmd28x22w','randomNum0':'838902'}).hint({randomNum0:1});
// //hint首选什么索引，不按顺序的设置

// result.map((n,i)=>{
//     printjson(n)
// })

// var endTime=(new Date()).getTime()-startTime;

// print('执行了'+endTime+'ms');



//.getIndexes()获得索引
//建立索引   .ensureIndex({randNum0:1})
//删除索引   .dropIndex
//全文索引   .ensureIndex({randNum0:'text'})
//查找全文索引   $text:{$search:''}

// db.info.find({$test:{$search:'family a b c -d'}})    //or关系的关键词   -号表示排除    \"love game\" 转义词表示一个词


// db.randomInfo.ensureIndex({randNum0:1})