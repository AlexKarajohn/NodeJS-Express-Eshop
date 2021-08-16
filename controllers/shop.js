const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit')
exports.getIndex = (req, res, next) => {
  Product.find()
  .then(products=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Index',
      path: '/',
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
  Product.find()
  .then(products=>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Product List',
      path: '/products',
      
    });
  })
  .catch(err=>{
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
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
  }).catch(err=>{
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
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
    .catch(err=>{
      console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
  .catch(err=>{
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
  .then(()=>{
    res.redirect('/cart')
  })
  .catch(err=>{
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
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
    .catch(err=>{
      console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
  .catch(err=>{
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};
exports.getInvoice = (req,res,next) =>{
  const orderId = req.params.orderId;
  
  const invoiceName = `invoice-${orderId}.pdf`;
  const invoicePath = path.join('data','invoices',invoiceName);

  Order.findById(orderId)
  .then(order=>{
    if(!order)
      return next(new Error('No order Found.'));
    if(order.user.userId.toString() !== req.user._id.toString())
      return next(new Error('Unauthorized.'));
      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type' ,'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text('Invoice',{underline:true});
      pdfDoc.fontSize(14).text('------------------------')
      let totalPrice = 0;
      console.log(order)
      order.products.forEach(product=>{
        totalPrice +=  product.quantity * product.product.price
        pdfDoc.fontSize(14).text(product.product.title + ' - ' + product.quantity + ' x $' + product.product.price )
      })
      pdfDoc.text('------------------------')
      pdfDoc.fontSize(20).text(`Total Price $${totalPrice}`)
      pdfDoc.end();
    // fs.readFile(invoicePath,(err,data)=>{
    //     if(err){
    //       return next(err);
    //     }
    //     res.setHeader('Content-Type' ,'application/pdf');
    //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
    //     res.send(data);
    // })  
    //instead of us reading the file AND THEN serving it, we stream it w/o preloading it to server RAM
    // const file = fs.createReadStream(invoicePath);

    // file.pipe(res);
  })
  .catch(err=>next(err))
  
}