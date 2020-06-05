var express = require("express");
var bodyParser = require("body-parser");
const path = require('path');
var http = require('http');
var User = require('./model/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session')
const multer = require('multer')
const flash = require('connect-flash')
const randomstring = require('randomstring')
const nodemailer = require('nodemailer')
const async = require('async')

//authentication
const { ensureAuthenticated } = require('./config/auth')

//autentication
const { ensureVerification } = require('./config/auth')

//.env variables
require('dotenv').config() 

//passort
require('./config/passport')(passport)


var app = express();

app.set('view engine', 'ejs');

var nStatic = require('node-static');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/blog', ({ useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify:false }));
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
console.log("connection succeeded");


var fileServer = new nStatic.Server('./public');

http.createServer(function (req, res) {

    fileServer.serve(req, res);
    console.log("connected to 6060");

}).listen(6060);

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

//connect flash
app.use(flash())

//Global Variables
app.use((req, res, next) =>{
    res.locals.success_msg =  req.flash('success_msg')
    res.locals.error_msg =  req.flash('error_msg')
    res.locals.ProPic =  req.flash('ProPic')
    
    next()
})

//Upload
const upload = multer({
    limits: {fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).array('files', 12)

  //Upload Single 
const uploads = multer({
    limits: {fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('file')
  
// Check File Type
function checkFileType(file, cb){
// Allowed ext
const filetypes = /jpeg|jpg|png|gif/;
// Check ext
const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
// Check mime
const mimetype = filetypes.test(file.mimetype);

if(mimetype && extname){
    return cb(null,true);
} else {
  cb('Error: Images Only!');
}
}
  

//homepage 
app.get('/', function (req, res) {
    res.render('index')

});

app.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
    })(req, res, next);

    console.log("sess id is" + req.sessionID);
})

//logout
app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

//signup form
app.get('/signup', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/signup.html'));
});

//information from sign up form
app.post('/sign_up', function (req, res) {
    let image;
    uploads(req, res, (err) => {
        if(err){
          throw err
          
        } else {
            if(req.file == undefined) {
                image = "NA"
            } else{
                image = (req.file.buffer).toString('base64')
            }
            const secretToken = randomstring.generate()
            var data = {
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              email: req.body.email,
              password: req.body.password,
              ProfilePic: image,
              secretToken: secretToken,
              active: false
          }
          User.findOne({ email: data.email }, function (err, result) {
            if (err) throw err;
            if (result == null) {
                console.log("record doesnt exist");
                const newUser = new User(data);
                //Hash password
                bcrypt.genSalt(10, (err, salt) =>{
                bcrypt.hash(newUser.password, salt, (err, hash) =>{
                    if(err) throw err
                    // set password to hash
                    newUser.password = hash
                    //save new user
                    newUser.save()
                        .then(user => {
                            req.flash('success_msg', `You are now registered, A verification code has been sent to ${req.body.email}`)
                            res.redirect('/verify')
                        })
                        .catch((err) => console.log(err))
                    
                    //compose an email
                    const output = `
                        <h1> Thank You for registration </h1>
                        <ul>
                            <li>Email: ${req.body.email}</li>
                            <li>code: ${secretToken}</li>
                        </ul>
                        <p>Please verify on url: <a herf = "http://localhost:3000/users/verify">http://localhost:3000/users/verify</a></p>
                    `
                    
                        //send email
                        // create reusable transporter object using the default SMTP transport
                        let transporter = nodemailer.createTransport({
                            
                            service: 'gmail',
                            auth: {
                                user: process.env.EMAIL, // generated ethereal user
                                pass: process.env.PASSWORD  // generated ethereal password
                            },
                            
                        });

                        
                        // setup email data with unicode symbols
                        let mailOptions = {
                            from: '"GlobeTrotters" <globetrotters0820@gmail.com>', // sender address
                            to: `${req.body.email}`, // list of receivers
                            subject: 'Verification code', // Subject line
                            text: 'Hello world?', // plain text body
                            html: output // html body
                        };

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Message sent: %s', info.messageId);   
                            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                        });

                })
            })

            }
            else {
                console.log(result);
                res.send("email id has been registered already");
            }
        });
       }
      })    
});

//Verify email
app.get('/verify', ensureVerification, (req, res) => res.render('verifyEmail'))

//Verify Email Handle
app.post('/verify', (req, res, next) => {
    const { secretToken } = req.body
    
     User.findOne({ 'secretToken': secretToken })
       .then((user) => { 
           if(!user) {
                req.flash('error_msg', 'No User Found')
                res.redirect('/verify')
           }else{
                user.active = true
                user.secretToken = ""
                user.save()

                req.flash('success_msg', 'You are Succesfully Verified In!')
                res.redirect('/')
           }
       }).catch((err) => console.log(err))
})

//trial for dashboard
app.get('/dashboard', ensureAuthenticated, (req, res) =>
    User.findOne({ email: req.user.email }, function (err, result) {
        if (err) throw err;
        //var obd = { dashboard: result };
        res.render('dashboard', {dashboard:result,user: req.user});
    })
)

//trial for blog submission
app.get('/newblog', function (req, res) {
    db.collection("world").find({}).toArray(function (err, result) {
        if (err) throw err;
        //var count = { submission: result };
        res.render('submission', {submission: result,user: req.user});
    })
});

app.post('/blog', function (req, res) {  
  upload(req, res, (err) => {
    if(err){
      throw err
      
    } else {
      if(req.files == undefined){
        console.log('errrr');
        
      } else {
        var n = req.files.length;
        let images = []
        for(var i=0;i<n;i++) {
            images.push((req.files[i].buffer).toString('base64'))
        }

        db.collection("world").findOne({ country: req.body.blog_country }, function (err, result) {
            if (err) throw err;
            var cont = result.continent;
            User.updateOne({email: req.user.email}, { $push: { continent: { continent_name: cont, blog: { country: req.body.blog_country,date: Date(), title: req.body.blog_title, category: req.body.blog_category, description: req.body.blog_description, content: req.body.blog_content, data: images}}}}, (err, result) => {
                if(err) throw err;
                req.flash('success_msg', 'Successfully uploaded!')
                res.redirect('/newblog')
            })    
        })
        
      }
    }
  })
})



//destinations page
app.get('/destination', function (req, res) {

    res.render('destination', {user: req.user})
});



//choose country pages
var test;
var wor;
var conb;
app.get('/asia', function (req, res) {
    db.collection("world").find({ continent: "Asia" }).toArray(function (err, result) {
        if (err) throw err;
        wor = result;
    });
    const filter_Q = { $filter: { input: "$continent", as: "continent", cond: { $eq: ["$$continent.continent_name", "Asia"] } } }
    User.aggregate([{ $project: { result: filter_Q, "first_name": 1,"last_name":1,"email":1 } }], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log(result);
            res.render('asia', {
                usersArray: result, usersArray2: wor, user: req.user
            })
        }
    });

});


app.get('/europe', function (req, res) {
    db.collection("world").find({ continent: "Europe" }).toArray(function (err, result) {
        if (err) throw err;
        wor = result;
    });
        const filter_Q = { $filter: { input: "$continent", as: "continent", cond: { $eq: ["$$continent.continent_name", "Europe"] } } }
    User.aggregate([{ $project: { result: filter_Q, "first_name": 1,"last_name":1,"email":1 } }], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log(result);
            res.render('europe', {
                usersArray: result, usersArray2: wor, user: req.user
            })
        }
    });
});
app.get('/africa', function (req, res) {
    db.collection("world").find({ continent: "Africa" }).toArray(function (err, result) {
        if (err) throw err;
        wor = result;
    });
    const filter_Q = { $filter: { input: "$continent", as: "continent", cond: { $eq: ["$$continent.continent_name", "Africa"] } } }
    User.aggregate([{ $project: { result: filter_Q, "first_name": 1,"last_name":1,"email":1 } }], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log(result);
            res.render('africa', {
                usersArray: result, usersArray2: wor, user: req.user
            })
        }
    });
});
app.get('/australia', function (req, res) {
    db.collection("world").find({ continent: "Australia" }).toArray(function (err, result) {
        if (err) throw err;
        wor = result;
    });
    const filter_Q = { $filter: { input: "$continent", as: "continent", cond: { $eq: ["$$continent.continent_name", "Australia"] } } }
    User.aggregate([{ $project: { result: filter_Q, "first_name": 1,"last_name":1,"email":1 } }], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log(result);
            res.render('australia', {
                usersArray: result, usersArray2: wor, user: req.user
            })
        }
    });
});
app.get('/namerica', function (req, res) {
    db.collection("world").find({ continent: "North America" }).toArray(function (err, result) {
        if (err) throw err;
        wor = result;
    });
    const filter_Q = { $filter: { input: "$continent", as: "continent", cond: { $eq: ["$$continent.continent_name", "North America"] } } }
    User.aggregate([{ $project: { result: filter_Q, "first_name": 1,"last_name":1,"email":1 } }], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log(result);
            res.render('namerica', {
                usersArray: result, usersArray2: wor, user: req.user
            })
        }
    });
});
app.get('/samerica', function (req, res) {
    db.collection("world").find({ continent: "South America" }).toArray(function (err, result) {
        if (err) throw err;
        wor = result;
    });
    const filter_Q = { $filter: { input: "$continent", as: "continent", cond: { $eq: ["$$continent.continent_name", "South America"] } } }
    User.aggregate([{ $project: { result: filter_Q, "first_name": 1,"last_name":1,"email":1 } }], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log(result);
            res.render('samerica', {
                usersArray: result, usersArray2: wor, user: req.user
            })
        }
    });
});

app.post('/country', function (req, res) {
    console.log(req.body.country);
    var c = req.body.country;
    User.aggregate([{$project:{result:{$filter:{input:"$continent",as:"continent",cond:{$eq:["$$continent.blog.country",c]}}},"first_name":1,"last_name":1,"email":1}}],function(err,result){
        if(err) throw err;
        res.render('country',{usersArray: result,country_name:c,user: req.user});
    })
    
   
});

app.post('/blogpage', function (req, res) {
    var blobj;
    User.aggregate([{$match: {email: req.body.blogEmail}},{$project:{result:{$filter:{input:"$continent",as:"continent",cond:{$eq:["$$continent.blog.title",req.body.blogTitle]}}},"first_name":1,"last_name":1,"email":1}}],function(err,result){
        if(err) throw err;
        res.render('blog',{blogArray: result,user: req.user});
    })
})

app.get('/profile',function(req,res){
    res.render('profile',{user: req.user});
});

app.post('/editProfile',function(req,res){
    User.updateOne({email: req.user.email}, { $set: {email: req.body.email, first_name: req.body.firstName, last_name: req.body.lastName}}, (err, result) => {
        if(err) throw err;
        req.flash('success_msg', 'Profile is Updated!')
        res.redirect('/profile')
    })        
});

app.post('/changeProPic', (req, res) => {
    req.flash('ProPic', 'Change Profile Picture')
    res.redirect('/profile')
})

app.post('/RemovePhoto', async (req, res) => {
     req.user.ProfilePic = "NA"
     await req.user.save()
     req.flash('success_msg', 'Profile Pic is deleted')
     res.redirect('/profile')
})

app.post('/upload', (req, res) => {
    uploads(req, res, (err) => {
     if(err){
       res.render('profile', {
         msg: err
       });
     } else {
       if(req.file == undefined){
         res.render('profile', {
           msg: 'Error: No File Selected!'
         });
       } else {
          User.findOne({ email: req.user.email }, (err, result) => {
               if(err) throw err
               if(result !== null) {
                  User.updateOne({ email: req.user.email }, {$set: { ProfilePic: (req.file.buffer).toString('base64')}}, (err, updated) => {
                      if(err) throw err
                      req.flash('success_msg', 'Profile Pic is Changed')
                      res.redirect('/profile')
                  })
               } 
           })
       }
     }
   });
 });
 app.post('/edit',function(req,res){
     var blogObj;
     console.log(req.user.email);
     console.log(req.body.blogTitle);
     db.collection("world").find({}).toArray(function (err, result) {
        if (err) throw err;
        //var count = { submission: result };
        blogObj = result;
        //res.render('editBlog', {submission: result,user: req.user});
    })
    User.aggregate([{$match: {email: req.user.email}},{$project:{result:{$filter:{input:"$continent",as:"continent",cond:{$eq:["$$continent.blog.title",req.body.blogTitle]}}},"first_name":1,"last_name":1,"email":1}}],function(err,result){
        if(err) throw err;
        res.render('editBlog',{blogArray: result,user: req.user, submission: blogObj});
    })
     //res.render('editBlog',{user: req.user})
 })

 app.post('/blogedit',function(req,res){
     console.log("edit blog here");
     console.log(req.body.blog_country);
     console.log(req.body.blog_content);
     console.log(req.body.blog_title);
     console.log(req.body.blog_description);
    db.collection("world").findOne({ country: req.body.blog_country }, function (err, result) {
        if (err) throw err;
        var cont = result.continent;
        User.updateOne({ email: req.user.email }, { $set: { continent: { continent_name: cont, blog: { country: req.body.blog_country,date: Date(), title: req.body.blog_title, description: req.body.blog_description, content: req.body.blog_content}}}}, (err, result) => {
            if(err) throw err;
            res.render('dashboard',{dashboard: req.user, user:req.user});
            
        })    
    });
 })



app.listen(3000, function () {
    console.log("connected to server 3000");
});