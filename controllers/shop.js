const Product = require('../models/product');

exports.getIndex = (req, res, next) => {
  Product.findAll()
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
  Product.findAll()
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
  //or use .findbyPk()
  Product.findAll({where: {id: prodId}})
  .then((products)=>{
    res.render('shop/product-detail', {
      product: products[0],
      pageTitle: products[0].title,
      path: '/products'
    })
  }).catch(err=>console.log(err))
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
  .then(cart => {
    return cart.getProducts()
    .then(products => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err=>console.log(err))
  })
  .catch(err=>console.log(err))
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  //get the cart
  req.user.getCart()
  .then(cart=>{
    fetchedCart = cart;
    return cart.getProducts({where:{id:prodId}})
  })
  //find the products in the cart
  .then(products =>{
    let product;
    if (products.length > 0 )
      product = products[0];
    if (product){
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
      return product;
    }
    return Product.findByPk(prodId)
  })
  .then((product)=>{
    return fetchedCart.addProduct(
      product,
      {through: {quantity:newQuantity}}
    )
  })
  .then(()=>{res.redirect('/cart');
  })
  .catch(err=>console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart()
  .then(cart=>{
    return cart.getProducts({where:{id:prodId}})
  })
  .then(products=>{
    const product = products[0];
    return product.cartItem.destroy();
  })
  .then(result=>{
    res.redirect('/cart');
  })
  .catch(err=>console.log(err));
};

exports.getOrders = (req, res, next) => {
  //get all products inside every order (due to the relation @ app.js)
  req.user.getOrders({include: ['products']})
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
  let fetchedCart ;
  req.user.getCart()
  .then(cart=>{
    fetchedCart = cart;
    return cart.getProducts();
  })
  .then((products)=>{
      return req.user
        .createOrder()
        .then(order => {
            return order.addProducts(products.map(product=>{
              product.orderItem = {quantity: product.cartItem.quantity}
              return product;
            }))
        })
        .catch(err=>console.log(err))
  })
  .then(result=>{
    //fetchedCart.destroy();
    fetchedCart.setProducts(null);
    res.redirect('/orders');
  })
  .catch(err=>console.log(err));
};