module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()){
            return next()
        }
        req.flash('error_msg', 'Please login')
        res.redirect('/')
    },
    ensureVerification: function(req, res, next) {
        if(req.isAuthenticated()){
            req.flash('error_msg', 'You are already logged in')
            res.redirect('/') 
        }
        return next()
    }
}