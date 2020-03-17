var express=require("express"); 
var bodyParser=require("body-parser"); 
const path = require('path');
var http = require('http');
  
var app=express()
//var testImg = require('path').join(__dirname,'/public'); 
//app.use(express.static(testImg));
var nStatic = require('node-static');
const mongoose = require('mongoose'); 
mongoose.connect('mongodb://localhost:27017/user'); 
var db=mongoose.connection; 
db.on('error', console.log.bind(console, "connection error")); 
db.once('open', function(callback){ 
    console.log("connection succeeded"); 
}) 
  
var fileServer = new nStatic.Server('./public');

http.createServer(function (req, res) {
    
    fileServer.serve(req, res);

}).listen(5000);

// all environments
//app.set('port', process.env.PORT || 3000);
//app.set('views', path.join(__dirname, 'views'));

  
app.use(bodyParser.json()); 
app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ 
    extended: true
})); 

  
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/views/index.html'));
}); 

app.get('/signup',function(req,res){
    res.sendFile(path.join(__dirname+'/views/signup.html'));
}); 

app.post('/sign_up', function(req,res){ 
    var fname = req.body.first_name; 
    var lname = req.body.last_name;
    var email =req.body.email; 
    var pass = req.body.password; 
     
    
    var data = { 
        "f_name": fname,
        "l_name": lname, 
        "email":email, 
        "password":pass,  
    } 

    console.log(data.name);
    db.collection('user_details').insertOne(data,function(err, collection){ 
         if (err) throw err; 
         console.log("Record inserted Successfully"); 
              
    }); 
    //res.send("values taken");    
    res.sendFile(path.join(__dirname+'/views/submission.html'));
    //return res.redirect('signup_success.html'); 
});

app.get('/destination',function(req,res){
    
    res.sendFile(path.join(__dirname+'/views/destination.html'));
});

app.get('/asia',function(req,res){    
    res.sendFile(path.join(__dirname+'/views/asia.html'));
});
app.get('/europe',function(req,res){    
    res.sendFile(path.join(__dirname+'/views/europe.html'));
});
app.get('/africa',function(req,res){    
    res.sendFile(path.join(__dirname+'/views/africa.html'));
});
app.get('/australia',function(req,res){    
    res.sendFile(path.join(__dirname+'/views/australia.html'));
});
app.get('/namerica',function(req,res){    
    res.sendFile(path.join(__dirname+'/views/namerica.html'));
});
app.get('/samerica',function(req,res){    
    res.sendFile(path.join(__dirname+'/views/samerica.html'));
});
app.listen(3000,function(){
    console.log("connected to server");
})