var express=require("express"); 
var bodyParser=require("body-parser"); 
const path = require('path');
// const mongoose = require('mongoose'); 
// mongoose.connect('mongodb://localhost:27017/gfg'); 
// var db=mongoose.connection; 
// db.on('error', console.log.bind(console, "connection error")); 
// db.once('open', function(callback){ 
//     console.log("connection succeeded"); 
// }) 
  

 
  
var app=express()
var testImg = require('path').join(__dirname,'/public'); 
app.use(express.static(testImg));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

  
app.use(bodyParser.json()); 
app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ 
    extended: true
})); 

  
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/views/index.html'));
}); 

app.get('/login',function(req,res){
    res.sendFile(path.join(__dirname+'/views/login.html'));
});

/*app.post('/loginuser',function(req,res){
    console.log(req.body.email);
    db.collection('details').findOne({email:req.body.email},function(err,user){
        console.log(user.email);
        if(user.email===req.body.email && user.password===req.body.password)
        res.sendFile(path.join(__dirname+'/views/signup_success.html'));
        if(user.email!= req.body.email || user.password!=req.body.password)
        res.send("that would be invalid");
        //else
        //res.sendFile(path.join(__dirname+'/views/login.html'));
    })
    //res.send("oops try again");
})*/

// app.post('/loginuser',function(req,res){

//     db.collection('details').find({ email: req.body.email,
//                                        password: req.body.password
//     }, function(err, user) {
//         console.log(user.email);
//         console.log(user.password);
//         console.log(req.body.email);
//         console.log(req.body.password);
//               if(user ===null){
//                 res.send("Login invalid");
//              }else if (user.email === req.body.email && user.password === req.body.password){
//                 res.sendFile(path.join(__dirname+'/views/signup_success.html'));
//            } else if (user.email !== req.body.email || user.password === req.body.password){
//             console.log("Enter correct email");
//             res.send("chuchu balls forgot email!");
//            }
//            else {
//              console.log("Credentials wrong");
//              res.send("Invalid password");
//            }
//     });

//  });
app.listen(3000,function(){
    console.log("connected to server");
})