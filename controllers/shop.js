const Product = require('../models/product');


exports.getIndex = (req, res, next) => {
  Product.fetchAll()
  .then(products=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Index',
      path: '/'
    });
  })
  .catch(err=>console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
  .then(products=>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Product List',
      path: '/products'
    });
  })
  .catch(err=>console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then((product)=>{
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    })
  }).catch(err=>console.log(err))
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(products => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err=>console.log(err))

};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId)
  Product.findById(prodId)
  .then(product=>{
    return req.user.addToCart(product);
  })
  .then(()=>{res.redirect('/cart');
  })
  .catch(err=>console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
  .then(()=>{
    res.redirect('/cart')
  })
  .catch(err=>console.log(err));
};

exports.getOrders = (req, res, next) => {
  //get all products inside every order (due to the relation @ app.js)
  req.user.getOrders()
  .then(orders=>{
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders
    });
  })
  .catch(err=>console.log(err))
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};


exports.postMakeOrder = (req,res,next) => {
  req.user
  .addOrder()
  .then(result=>{
    //fetchedCart.destroy();
    res.redirect('/orders');
  })
  .catch(err=>console.log(err));
};