var express = require("express");
var bodyParser = require("body-parser");
const path = require('path');
var http = require('http');
var User = require('./model/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session')

const { ensureAuthenticated } = require('./config/auth')


//passort
require('./config/passport')(passport)

//console.log("exported value is "+v.variable.apple);
var app = express();
//var testImg = require('path').join(__dirname,'/public'); 
//app.use(express.static(testImg));
app.set('view engine', 'ejs');

var nStatic = require('node-static');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/blog', ({ useUnifiedTopology: true, useNewUrlParser: true }));
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
    console.log("connection succeeded");



var fileServer = new nStatic.Server('./public');

http.createServer(function (req, res) {

    fileServer.serve(req, res);
    console.log("connected to 6060");

}).listen(6060);

// all environments
//app.set('port', process.env.PORT || 3000);
//app.set('views', path.join(__dirname, 'views'));
//comments added

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

//session
app.use(session({
    secret: 'Khushi_jahnavi',
    resave: true,
    saveUninitialized: true
}))

//session login done
//passport
app.use(passport.initialize())
app.use(passport.session())

//homepage 
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
    })(req, res, next);

    console.log("sess id is" + req.sessionID);
})

//signup form
app.get('/signup', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/signup.html'));
});
//information from sign up form
app.post('/sign_up', function (req, res) {
    var data = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password

    }


    User.findOne({ email: data.email }, function (err, result) {
        if (err) throw err;
        if (result == null) {
            console.log("record doesnt exist");
            const new_user = new User(data);
            bcrypt.genSalt(10, function (err, salt) {
                if (err)
                    return next(err);
                bcrypt.hash(new_user.password, salt, function (err, hash) {
                    if (err) throw err;

                    // override the cleartext password with the hashed one
                    new_user.password = hash;
                    new_user.save(function (err) {
                        if (err) return handleError(err);
                        res.redirect("/");
                    });

                });
            });
        }

        else {
            console.log(result);
            res.send("email id has been registered already");
        }
    });

});


//trial for dashboard
app.get('/dashboard', ensureAuthenticated, (req, res) =>
    User.findOne({email: req.user.email},function(err,result){
        if(err) throw err;
        var obd = {dashboard: result};
        //console.log(result);
        res.render('dashboard',obd);
    })
)

//trial for blog submission
/*app.get('/submission', function (req, res) {
    res.render('submission');
});*/
app.get('/newblog', function (req, res) {
    db.collection("world").find({}).toArray(function (err, result) {
        if (err) throw err;
        //console.log(result);
        var count = { submission: result };
        res.render('submission', count);
    })
    //res.render('submission');
    //console.log("sess id is" + req.sessionID);
    //console.log("user is " + req.user.email);

});

app.post('/blog', function (req, res) {
    console.log(req.body.blog_title);
    console.log(req.body.blog_country);
    console.log(req.body.blog_category);
    console.log(req.body.blog_description);
    console.log(req.body.blog_content);
    db.collection("world").findOne({ country: req.body.blog_country }, function (err, result) {
        if (err) throw err;
        //console.log(result);
        //console.log(result.continent);
        var cont = result.continent;
        User.findOneAndUpdate({ "email": req.user.email }, { $push: { continent: { continent_name: cont, blog: { country: req.body.blog_country, title: req.body.blog_title, category: req.body.blog_category, description: req.body.blog_description, content: req.body.blog_content } } } }, { upsert: true }, function (err, doc) {
            if (err) throw err;
            console.log("updated");
        });
    })
})



//destinations page
app.get('/destination', function (req, res) {

    res.sendFile(path.join(__dirname + '/views/destination.html'));
});



//choose country pages
var test;
var wor;
var conb;
app.get('/asia', function (req, res) {
    db.collection("world").find({ continent: "Asia" }).toArray(function (err, result) {
        if (err) throw err;
        //console.log('first result is ' + result);
        //test= {'name': 'cadbury',
          //          'type': 'candy'};
        //var obj = { asia: result };
        wor=result;
        //console.log('wor is ' + wor);
        
        
    })
    db.collection('users').find({}).toArray(function(err,results){
        if(err) throw err;
        conb = results;
        //results.forEach(function(ar){
            //console.log('ar is');
            //console.log(ar);
            /*ar.continent.forEach(function(arr){
                if(arr.continent_name=='Asia'){
                    console.log('arr is');
                    console.log(arr);
                    if(!conb.includes(arr))
                    conb.push(arr);
                 }
                
            })*/
        //})
        //console.log('results of user : ');
        //console.log(results);
        //console.log('wor is ' );
        //console.log(wor);
       // console.log('conblog is');
    //console.log(conb);
    //console.log(conb.length);
    });
    
    res.render('asia', {asia: wor,blogs: conb});
    //res.sendFile(path.join(__dirname + '/views/asia.html'));

});
app.get('/europe', function (req, res) {
    db.collection("world").find({ continent: "Europe" }).toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        var obj = { europe: result };
        res.render('europe', obj);
    })
    //res.sendFile(path.join(__dirname + '/views/europe.html'));
});
app.get('/africa', function (req, res) {
    db.collection("world").find({ continent: "Africa" }).toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        var obj = { africa: result };
        res.render('africa', obj);
    })
    //res.sendFile(path.join(__dirname + '/views/africa.html'));
});
app.get('/australia', function (req, res) {
    db.collection("world").find({ continent: "Australia" }).toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        var obj = { australia: result };
        res.render('australia', obj);
    })
    //res.sendFile(path.join(__dirname + '/views/australia.html'));
});
app.get('/namerica', function (req, res) {
    db.collection("world").find({ continent: "North America" }).toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        var obj = { namerica: result };
        res.render('namerica', obj);
    })
    //res.sendFile(path.join(__dirname + '/views/namerica.html'));
});
app.get('/samerica', function (req, res) {
    db.collection("world").find({ continent: "South America" }).toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        var obj = { samerica: result };
        res.render('samerica', obj);
    })
    //res.sendFile(path.join(__dirname + '/views/samerica.html'));
});

app.post('/country', function (req, res) {
    console.log(req.body.country);
});







app.listen(3000, function () {
    console.log("connected to server 3000");
})

