var express=require("express"); 
var bodyParser=require("body-parser"); 
const path = require('path');
var http = require('http');
  
var app=express()
//var testImg = require('path').join(__dirname,'/public'); 
//app.use(express.static(testImg));
var nStatic = require('node-static');

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

app.get('/destination',function(req,res){
    
    res.sendFile(path.join(__dirname+'/views/destination.html'));
});

app.listen(3000,function(){
    console.log("connected to server");
})