const User = require('../models/user')

exports.getLogin = (req,res,next) => {
    res.render('auth/login',{
        path:'/login',
        pageTitle:'Login',
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.postLogin = (req,res,next) => {
    User.findById("6114fe35fbdd297ad8251910")
    .then(user=>{
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save((err)=>{
            if(err)
            console.log(err);
            res.redirect('/')
        })
    })
    .catch(err=>console.log(err))
}
exports.postLogout = (req,res,next) => {
    req.session.destroy((err)=>{
        if(err)
        console.log(err);
        res.redirect('/');
    });
}