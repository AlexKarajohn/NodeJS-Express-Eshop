const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit')
const stripePrivKey = require('../vars').stripePrivKey;
const stripe = require('stripe')(stripePrivKey);
const ITEMS_PER_PAGE = 3 ;


exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems ;
  Product.find()
  .countDocuments()
  .then((numProducts)=>{
    totalItems = numProducts;
    return   Product.find()
    .skip((page-1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  })
  .then(products=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Index',
      path: '/',
      currentPage : page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage : page > 1,
      nextPage: page + 1,
      previousPage : page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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
  const page = +req.query.page || 1;
  let totalItems ;
  Product.find()
  .countDocuments()
  .then((numProducts)=>{
    totalItems = numProducts;
    return   Product.find()
    .skip((page-1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  })
  .then(products=>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: '/products',
      currentPage : page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage : page > 1,
      nextPage: page + 1,
      previousPage : page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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
exports.getCheckoutSuccess = (req,res,next) => {
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
exports.getCheckout = (req,res,next) =>{
  let products ;
  let total = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      products = user.cart.items
      user.cart.items.forEach(p=>{
        total += p.quantity * p.productId.price;
      })
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(p=>{
          return {
            name : p.productId.title,
            description : p.productId.description,
            amount: p.productId.price * 100,
            currency: 'usd',
            quantity: p.quantity
          };
        }),
        success_url:req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url:req.protocol + '://' + req.get('host') + '/checkout/cancel',
      });
    })
    .then(session=>{
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total,
        sessionId:session.id
      });
    })
    .catch(err=>{
      console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

}