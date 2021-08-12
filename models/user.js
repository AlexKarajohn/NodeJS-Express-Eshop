const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    },
    email: {
        type: String,
        require: true,
    },
    cart : {
        items : [
            {
                productId:{ type: mongoose.Schema.Types.ObjectId, required:true, ref:'Product' },
                quantity: { type: Number, required:true }
            }
            ]
    }
})

userSchema.methods.addToCart = function(product){
        //look for the incoming product inside my cart
        const cartProductIndex = this.cart.items.findIndex(cp=>{
            return cp.productId.toString() === product._id.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        //if the product exists in the cart then add +1  to the quantity of the object inside the cart.items
        if(cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        }
        else 
            updatedCartItems.push({productId: product._id, quantity: newQuantity})

        const updatedCart = {items : updatedCartItems}
        this.cart= updatedCart;
        return this.save();
}
// userSchema.methods.getCart = function(){
//        return mongoose.model('User')
//             .findById(this._id)
//             .populate('cart.items.productId')
//             .then(user=>{
//                 return user.cart.items
//             })

// }
userSchema.methods.removeFromCart = function(prodId){
    const updatedCartItems = this.cart.items.filter((item)=>{
        return item.productId.toString() !== prodId.toString()
    })
    this.cart.items = updatedCartItems;
    return this.save()

}

module.exports= mongoose.model('User',userSchema);

// const getDb = require('../util/database').getDb
// const mongodb = require('mongodb');

// class User {
//     constructor(username,email,cart,id){
//         this.name = username;
//         this.email = email;
//         this.cart = cart; //{items:[]}
//         this._id = id;
//     }
//     save(){
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }
//     removeFromCart(productId){
//         const db = getDb();
//         const updatedCartItems = this.cart.items.filter(item=>{
//             return item.productId.toString() !== productId.toString()
//         })
  
//         return db.collection('users').updateOne({_id: this._id},{$set:{cart : {items: updatedCartItems} }})
//     }
//     addToCart(product){
//         //look for the incoming product inside my cart
//         const cartProductIndex = this.cart.items.findIndex(cp=>{
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         //if the product exists in the cart then add +1  to the quantity of the object inside the cart.items
//         if(cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         }
//         else 
//             updatedCartItems.push({productId: new mongodb.ObjectId(product._id), quantity: newQuantity})

//         const updatedCart = {items : updatedCartItems}
//         const db = getDb();
//         return db.collection('users')
//                 .updateOne({_id: new mongodb.ObjectId(this._id)},{$set:{cart:updatedCart}})
//     }
//     getCart(){
//         const db = getDb(); 
//         const productsIds = this.cart.items.map(i=>{
//             return i.productId;
//         });
//         return db.collection('products')
//                 .find({_id: {$in: productsIds}})
//                 .toArray()
//                 .then(products=>{
//                     return products.map((product)=>{
//                             return {
//                                 ...product,
//                                 quantity: this.cart.items.find(i=>{
//                                     return i.productId.toString() === product._id.toString();
//                                 }).quantity
//                         }
//                     })
//                 })
//     }
//     addOrder(){
//         const db = getDb();
//         return this.getCart().then(products=>{
//             const order = {
//                 items : products,
//                 user:{
//                     _id : new mongodb.ObjectId(this._id),
//                     name: this.name,
//                     email: this.email,
//                 }
//             }
//             return db.collection('orders').insertOne(order)
//                 .then(result=>{
//                     this.cart = {items : []};
//                     return db.collection('users')
//                               .updateOne({_id: new mongodb.ObjectId(this._id)},{$set:{cart:{items: []}}})
//                 })
//         })
        
        
//     }
//     getOrders(){
//         const db = getDb();
//         return db.collection('orders').find({'user._id': new mongodb.ObjectId(this._id)}).toArray()
                
//     }
//     static findByEmail(email){
//         const db = getDb();
//         return db.collection('users').findOne({email})
//     }
//     static findById(userId){
//         const db = getDb();
//         return db.collection('users').findOne({_id: new mongodb.ObjectId(userId)}).then((user)=>{return user})
//     }
// }

// module.exports = User;