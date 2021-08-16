const User = require('../models/user');
const nodemailer = require('nodemailer');
//const sendgridTransport = require('nodemailer-sendgrid-transport')
const bcrypt = require('bcryptjs');
const apiKey = require('../vars').transporterAPIkey;

const gmailCred = require('../vars').gmailCred;
const crypto = require('crypto');

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

  exports.getReset = (req,res,next) =>{
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: req.flash('error')
      });
  }
  exports.postReset = (req,res,next) =>{
    crypto.randomBytes(32,(err, buffer)=>{
        if(err)
        {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email:req.body.email})
        .then((user)=>{
            if(!user)
                {
                    req.flash('error','User Not Found');
                    return res.redirect('/reset')
                }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now()+ 3600000;
            return user.save();
        })
        .then((result)=>{
            console.log('sending email & redirecting')
            console.log(gmailCred.username)
            res.redirect('/login');
            transporter.sendMail({
                to: req.body.email,
                from: gmailCred.username,
                subject:'Password Reset',
                html: `
                    <p> You Requested a password reset</p>
                    <p> click this <a href="http://localhost:3000/reset/${token}"> link for a new password</a></p>
                `
            }) 
        })
        .catch(err=>console.log(err))
    })
  }
  exports.getNewPassword=(req,res,next)=>{
    const token = req.params.token;
    User.findOne({resetToken:token,resetTokenExpiration:{$gt: Date.now()}})
    .then(user=>{
        if(!user)
            return res.redirect('/')
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'Reset Password',
            errorMessage: req.flash('error'),
            userId: user._id.toString(),
            passwordToken: token
          });
    })
    .catch(err=>console.log(err));
  }
  exports.postNewPassword=(req,res,next)=>{
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({
        resetToken:passwordToken,
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId
    })
    .then((user)=>{
        resetUser= user;
        return bcrypt.hash(newPassword,12)
    })
    .then((hashedPassword)=>{
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(result=>{
        res.redirect('/login');
        transporter.sendMail({
            to: resetUser.email,
            from: gmailCred.username,
            subject:'Password Reset',
            html: `
                <p> You have reset your password.</p>
            `
        })
    })
    .catch(err=>console.log(err))
  }