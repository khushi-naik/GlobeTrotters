const LocalStrategy =  require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Load User model
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
          if(!isMatch) {
            //Password Match
            return done(null, false, { message: 'Password incorrect' });
          }

          if(!user.active) {
            //Verification of E-mail
            return done(null, false, { message: 'Please verify The E-mail First' });
          }

          //All Done
          return done(null, user);
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