const express = require('express');
const {check,body} = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth');
const User = require('../models/user');
router.get('/login',authController.getLogin);
router.post('/login',
        [
            body('email', 'Please enter a valid Email')
                .isEmail()
                .normalizeEmail({ gmail_remove_dots: false }),
            body('password', 'Please enter a valid Password')
                .isLength({min:5,max:25})
                .isAlphanumeric()
                .trim()
        ]
        ,authController.postLogin);

router.get('/signup', authController.getSignup);
router.post('/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Email is not Valid')
            .custom((value,{req})=>{
                // if(value === 'test@test.com'){
                //     throw new Error ('this email is forbidden');
                // }
                // return true;
                return User.findOne({email: value})
                    .then((user)=>{
                        if(user){
                        return Promise.reject('this email is already in use.');
                        }
                    })
            })
            .normalizeEmail({ gmail_remove_dots: false }),
        body('password','Please enter a pass with only numbers and text and have at least 5 characters')
            .isLength({min: 5, max: 25})
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .isLength({min: 5,max:25})
            .custom((value,{req})=>{
                if (value !== req.body.password)
                    throw new Error('Passwords have to match');
                return true;
            })
            .trim()
    ],authController.postSignup);

router.post('/logout',authController.postLogout);

router.get('/reset',authController.getReset);
router.post('/reset',authController.postReset);

router.get('/reset/:token',authController.getNewPassword);
router.post('/new-password',authController.postNewPassword);

module.exports = router;