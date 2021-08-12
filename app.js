

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const User = require('./models/user');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req,res,next)=>{
    User.findByEmail('alex@alex.alex')
    .then(user=>{
        req.user = new User(user.name , user.email, user.cart, user._id);
        next();
    })
    .catch(err=>console.log(err))
    //next();
})
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(()=>{
    console.log('after connected')
    User.findByEmail('alex@alex.alex')
    .then((result)=>{
        if(!result){
            console.log('user wasnt found, created a new one.')
            const user = new User('alex','alex@alex.alex',{items:[]})
            user.save();
        }
        
    })
    app.listen(3000);
})


