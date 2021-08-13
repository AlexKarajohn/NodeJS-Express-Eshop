const User = require('../models/user');
const nodemailer = require('nodemailer');
//const sendgridTransport = require('nodemailer-sendgrid-transport')
const bcrypt = require('bcryptjs');
const apiKey = require('../vars').transporterAPIkey;

const gmailCred = require('../vars').gmailCred;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailCred.username,
        pass: gmailCred.pass,
        }
});

exports.getLogin = (req,res,next) => {
    res.render('auth/login',{
        path:'/login',
        pageTitle:'Login',
        errorMessage: req.flash('error')
    })
}

exports.postLogin = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email:email})
    .then(user=>{
        if(!user){
            req.flash('error','Invalid Email or Password.')
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
                    req.flash('error','Invalid Email or Password.')
                    res.redirect('/')
                })
            }
            req.flash('error','Invalid Email or Password.')
            res.redirect('/login')
        })
        .catch(err=>{
            console.log(err);
            req.flash('error','Invalid Email or Password.')
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
      errorMessage: req.flash('error')
    });
  };
  exports.postSignup = (req, res, next) => {
        const email= req.body.email;
        const password = req.body.password;
        const confPassword = req.body.confirmPassword;
        User.findOne({email: email})
        .then((user)=>{
            if(user){
                req.flash('error','Email already exists.')
                return res.redirect('/signup');
            }
            return bcrypt.hash(password,12)
                    .then((hashedPass)=>{
                        const newUser = new User({
                            email,
                            password:bcrypt.hashSync(password,12),
                            cart:{items:[]}
                        })
                        return newUser.save()
                            .then(()=>{
                                res.redirect('/login')
                                return transporter.sendMail({
                                    to: email,
                                    from: gmailCred.username,
                                    subject:'Sign up Complete',
                                    html: '<h1>Everything went ok</h1>'
                                }) 
                            })
                            .catch(err=>console.log(err));
                    })
        })
        .catch(err=>console.log(err))
    
  };