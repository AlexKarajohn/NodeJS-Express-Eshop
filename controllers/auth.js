const User = require('../models/user');

const bcrypt = require('bcryptjs');

exports.getLogin = (req,res,next) => {
    res.render('auth/login',{
        path:'/login',
        pageTitle:'Login',
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.postLogin = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email:email})
    .then(user=>{
        if(!user){
            return res.redirect('/login')
        }
        bcrypt.compare(password, user.password)
        .then(doMatch=>{
            if(doMatch)
            {
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save((err)=>{
                    if(err)
                    console.log(err);
                    res.redirect('/')
                })
            }
            res.redirect('/login')
        })
        .catch(err=>{
            console.log(err);
            res.redirect('/login');
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
exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false
    });
  };
  exports.postSignup = (req, res, next) => {
        const email= req.body.email;
        const password = req.body.password;
        const confPassword = req.body.confirmPassword;
        User.findOne({email: email})
        .then((user)=>{
            if(user){
                return res.redirect('/signup');
            }
            return bcrypt.hash(password,12)
                    .then((hashedPass)=>{
                        const newUser = new User({
                            email,
                            password:bcrypt.hashSync(password,12),
                            cart:{items:[]}
                        })
                        return newUser.save().then(()=>res.redirect('/login'))
                    })
        })
        .catch(err=>console.log(err))
    
  };