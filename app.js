const dbuname = require('./vars').dbuname;
const dbpass = require('./vars').dbpass;
const sessionPass = require('./vars').sessionPass;
const path = require('path');
const csrf = require('csurf');
const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const errorController = require('./controllers/error');
const mongoose =require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');
const MONGODB_URI = `mongodb+srv://${dbuname}:${dbpass}@cluster0.czne7.mongodb.net/shop?retryWrites=true&w=majority`
const app = express();
//here we create a store to be used for our sessions
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
});
//multer options objects
const fileStorage = multer.diskStorage({
    destination: (req,file, cb)=>{
        cb(null,'images')
    },
    filename: (req,file,cb)=>{
        cb(null, new Date().toISOString() + '-' + file.originalname );
    },
});
const fileFilter = (req,file,cb) => {
    if(file.mimetype ==='image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' )
    cb(null,true)
    else
    cb(null,false);
}


app.set('view engine', 'ejs');
app.set('views', 'views');
const csrfProtection = csrf();
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');

const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage,fileFilter: fileFilter}).single('image'))
//serve static path for css etc
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
//secret is the key for the cookie & session // add the store so the sessions will be saved in the db
app.use(session({
        secret:sessionPass, 
        resave:false,
        saveUnitialized:false,
        store,
    }))
app.use(csrfProtection);
app.use(flash());
app.use((req,res,next)=>{
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken();
    next()
})
app.use((req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
        .then(user=>{
            if(!user){
                return next();
            }
            req.user=user;
            next();
        })
        .catch(err=>{
            next(new Error(err))
        })

    // if(req.session.user){
    //     User.findById(req.session.user._id,(err,user)=>{
    //         if(!err && user){
    //             req.user = user;
    //             next();
    //         }
    //         else{
    //             console.log('no user was found for this session')
    //             next();
    //         }
            
    //     })
    // }
    // else
    // next();
})


 //routes
 app.use('/admin', adminRoutes);
 app.use(shopRoutes);
 app.use(authRoutes);
app.use('/500',errorController.get500);
app.use(errorController.get404);

app.use((error,req,res,next)=>{
    //res.status(error.httpStatusCode).render(...);
    console.log(error)
    res.redirect('/500');
})

mongoose.connect(MONGODB_URI)
.then(()=>{
    console.log('MongoDB connected');
    app.listen(3000);
})
.catch(err=>console.log(err));

