const { validationResult } = require('express-validator');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  if(!req.session.isLoggedIn){
    return res.redirect('/login')
  }
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: '',
    oldInput : {},
    validationErrors : [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  if(!errors.isEmpty())
  {
    return res.status(422).render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/edit-product',
        editing: false,
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: errors.array()[0].msg,
        oldInput : {
          title,
          price,
          imageUrl,
          description  
        },
        validationErrors : errors.array(),
      });
  }
  const product = new Product({
                                title, 
                                price, 
                                description,
                                imageUrl, 
                                userId: req.user
                              });
  product.save()
  .then(result=>{
    console.log('Product Created')
    res.redirect('/admin/products');
  })
  .catch(err=>{
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
  //   return res.status(422).render('admin/edit-product', {
  //     pageTitle: 'Add Product',
  //     path: '/admin/edit-product',
  //     editing: false,
  //     isAuthenticated: req.session.isLoggedIn,
  //     errorMessage: 'DB operation failed, please try again',
  //     oldInput : {
  //       title,
  //       price,
  //       imageUrl,
  //       description  
  //     },
  //     validationErrors : [],
  //   });
  // })

};
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then((product)=>{
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: '',
      oldInput : {price:'',title:'',imageUrl:'',description:''},
      validationErrors : [],
    });
  })
  .catch(err=>{
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postEditProduct = (req, res, next) => {
  const errors = validationResult(req);
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  if(!errors.isEmpty()){
    return Product.findById(prodId)
      .then((product)=>{
        if (!product) {
          return res.redirect('/');
        }
        return res.status(422).render('admin/edit-product', {
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          editing: true,
          product: product,
          isAuthenticated: req.session.isLoggedIn,
          errorMessage: errors.array()[0],
          oldInput : {
            price : updatedPrice,
            title: updatedTitle,
            description: updatedDesc,
            imageUrl: updatedImageUrl,
          },
          validationErrors : errors.array(),
        });
      })
  }
  Product.findById(prodId).then(product=>{
    if(product.userId.toString() !== req.user.id.toString())
    {
      return res.redirect('/');
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    product.desc = updatedDesc
    return product.save().then(()=>{
          console.log('Updated Product')
          res.redirect('/admin/products');
      });
  })
  .catch(err=>{
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id}).select('title price imageUrl').populate('userId','email -_id')
  .then(products=>{
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
      isAuthenticated: req.session.isLoggedIn
    });
  })
  .catch(err=>{
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({_id: prodId, userId: req.user._id})
  .then(()=>{
    console.log('Product Deleted');
    res.redirect('/admin/products');
  })
  .catch(err=>{
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};
