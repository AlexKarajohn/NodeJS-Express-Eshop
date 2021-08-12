const Product = require('../models/product');
const ObjectId = require('mongodb').ObjectId;

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  console.log(req.user._id)
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
  .catch(err=>console.log(err))
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
      product: product
    });
  })
  .catch(err=>console.log(err))
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  Product.findById(prodId).then(product=>{
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    product.desc = updatedDesc
    return product.save();
  })
  .then(()=>{
    console.log('Updated Product')
    res.redirect('/admin/products');
})
  .catch(err=>console.log(err))
};

exports.getProducts = (req, res, next) => {
  Product.find().select('title price imageUrl').populate('userId','name -_id')
  .then(products=>{
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  })
  .catch(err=>console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
  .then(()=>{
    console.log('Product Deleted');
    res.redirect('/admin/products');
  })
  .catch((err)=>console.log(err))
};
