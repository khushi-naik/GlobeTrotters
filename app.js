var express = require("express");
var bodyParser = require("body-parser");
const path = require('path');
var http = require('http');
var User = require('./model/User');
const bcrypt = require('bcrypt');
const passport = require('passport');
//console.log("exported value is "+v.variable.apple);
var app = express();
//var testImg = require('path').join(__dirname,'/public'); 
//app.use(express.static(testImg));
app.set('view engine', 'ejs');
var nStatic = require('node-static');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/blog');
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) {
    console.log("connection succeeded");
})

var fileServer = new nStatic.Server('./public');

http.createServer(function (req, res) {

    fileServer.serve(req, res);
    console.log("connected to 5000");

}).listen(5000);

// all environments
//app.set('port', process.env.PORT || 3000);
//app.set('views', path.join(__dirname, 'views'));


app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));


//homepage 
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.post('/login',function(req,res,next){
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
        failureFlash : true 
    })(req,res,next);
    //res.send("login page comes here");
})
//signup form
app.get('/signup', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/signup.html'));
});
//information from sign up form
app.post('/sign_up', function (req, res) {
        var data = {
            first_name : req.body.first_name,
            last_name : req.body.last_name,
            email : req.body.email,
            password : req.body.password

        }

        console.log(data);
        User.findOne({email : data.email},function(err,result){
            if(err) throw err;
            if(result == null){
            console.log("record doesnt exist");
            const new_user = new User(data);
            bcrypt.genSalt(10,function(err,salt){
                if(err)
                 return next(err);
                 bcrypt.hash(new_user.password, salt, function(err, hash) {
                    if (err) throw err;
            
                    // override the cleartext password with the hashed one
                    new_user.password = hash;
                    new_user.save(function(err){
                        if (err) return handleError(err);
                        res.send("user recorded successfully");
                    });
                    
                });
            });
            }
            //console.log(result.length);
            else{
            console.log(result);
            res.send("email id has been registered already");
            }
        });
        
    /*var fname = req.body.first_name; 
  var lname = req.body.last_name;
  var email =req.body.email; 
  var pass = req.body.password; */


    /*var data = { 
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
    //return res.redirect('signup_success.html'); */
});




//trial for dashboard
app.get('/dashboard', function (req, res) {
    res.render('dashboard');
});



//trial for blog submission
app.get('/submission', function (req, res) {
    res.render('submission');
});



//destinations page
app.get('/destination', function (req, res) {

    res.sendFile(path.join(__dirname + '/views/destination.html'));
});



//choose country pages
app.get('/asia', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/asia.html'));
});
app.get('/europe', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/europe.html'));
});
app.get('/africa', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/africa.html'));
});
app.get('/australia', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/australia.html'));
});
app.get('/namerica', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/namerica.html'));
});
app.get('/samerica', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/samerica.html'));
});







app.listen(3000, function () {
    console.log("connected to server 3000");
})

