const dbuname = require('./vars').dbuname;
const dbpass = require('./vars').dbpass;
const sessionPass = require('./vars').sessionPass;
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoose =require('mongoose');
const session = require('express-session');
//this library is used to make a session save in mongo
const MongoDBStore = require('connect-mongodb-session')(session);
const MONGODB_URI = `mongodb+srv://${dbuname}:${dbpass}@cluster0.czne7.mongodb.net/shop?retryWrites=true&w=majority`
const app = express();
//here we create a store to be used for our sessions
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
});

app.set('view engine', 'ejs');
app.set('views', 'views');

 const adminRoutes = require('./routes/admin');
 const authRoutes = require('./routes/auth');
 const shopRoutes = require('./routes/shop');

const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
//serve static path for css etc
app.use(express.static(path.join(__dirname, 'public')));
//secret is the key for the cookie & session // add the store so the sessions will be saved in the db
app.use(session({
        secret:sessionPass, 
        resave:false,
        saveUnitialized:false,
        store,
    }))

 app.use((req,res,next)=>{
    if(req.session.user){
        User.findById(req.session.user._id,(err,user)=>{
            if(!err && user){
                req.user = user;
                next();
            }
            else
            next();
        })
    }
    else
    next();
 })
 app.use('/admin', adminRoutes);
 app.use(shopRoutes);
 app.use(authRoutes);
app.use(errorController.get404);


mongoose.connect(MONGODB_URI)
.then(()=>{
    console.log('MongoDB connected');
    app.listen(3000);
})
.catch(err=>console.log(err));

