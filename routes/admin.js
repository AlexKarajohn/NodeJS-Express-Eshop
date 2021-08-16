const path = require('path');
const {check,body} = require('express-validator');
const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth')
const router = express.Router();


 //admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products',isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product'
    ,isAuth,
    [
        body('title')
            .trim()
            .custom((title)=>{
                if(title.length < 5 ) 
                    throw new Error ('Title must be at least 5 characters')
                return true
            }),
        body('price','Please Enter a valid Price')
            .trim()
            .isCurrency({require_symbol:false,allow_decimal:true,require_decimal:false,digits_after_decimal:[2]}),
        body('description','Please Enter a valid Description')
            .trim()
            .custom((desc)=>{
                if(desc.length < 5 ) 
                    throw new Error ('Description must be at least 5 characters')
                return true
            }),
    ]
    , adminController.postAddProduct);

router.get('/edit-product/:productId',isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth,
    [
        body('title')
            .trim()
            .custom((title)=>{
                if(title.length < 5 ) 
                    throw new Error ('Title must be at least 5 characters')
                return true
            }),
        body('price','Please Enter a valid Price')
            .trim()
            .isCurrency({require_symbol:false,allow_decimal:true,require_decimal:false,digits_after_decimal:[2]}),
        body('description','Please Enter a valid Description')
            .trim()
            .custom((desc)=>{
                if(desc.length < 5 ) 
                    throw new Error ('Description must be at least 5 characters')
                return true
            }),
    ]
    ,adminController.postEditProduct);

router.post('/delete-product',isAuth, adminController.postDeleteProduct);

module.exports = router;
