const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
  Product.find()
  .then(products=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Index',
      path: '/',
    });
  })
  .catch(err=>console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
  .then(products=>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Product List',
      path: '/products',
      
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
      path: '/products',
      
    })
  }).catch(err=>console.log(err))
};

exports.getCart = (req, res, next) => {
  if(req.user){
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: user.cart.items,
        
      });
    })
    .catch(err=>console.log(err))
  }else {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: [],

    })
  }
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
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
  if(req.user){
    Order.find({'user.userId': req.user._id})
    .then(orders=>{
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders,
        
      });
    })
    .catch(err=>console.log(err))
  }else{
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: [],

    })
  }
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',

  });
};


exports.postMakeOrder = (req,res,next) => {
  req.user.populate('cart.items.productId').execPopulate()
  .then(user => {
    const products = user.cart.items.map((productData)=>{
      return {
        quantity: productData.quantity,
        product: {...productData.productId._doc}   
      }
    });
    const order = new Order({
      products: products,
      user: {
        email: req.user.email,
        userId: req.user._id
      }
    })
    return order.save()
  })
  .then(()=>{
    req.user.cart.items = [];
    return req.user.save();
  })
  .then(result=>{
    res.redirect('/orders');
  })
  .catch(err=>console.log(err));
};