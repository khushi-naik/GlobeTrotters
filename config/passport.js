const LocalStrategy =  require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../model/User');

module.exports = function(passport) {
    passport.use(
      new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        // Match user
        User.findOne({
          email: email
        }).then(user => {
          if (!user) {
            return done(null, false, { message: 'That email is not registered' });
          }
  
          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              //console.log("sess id is" +req.sessionID);

              return done(null, user);
            } else {
              return done(null, false, { message: 'Password incorrect' });
            }
          })
        })
      })
    )
  
    passport.serializeUser((user, done) => {
      done(null, user.id);
    })
  
    passport.deserializeUser((id, done) => {
      User.findById(id, (err, user) => {
        done(err, user);
      })
    })
  }