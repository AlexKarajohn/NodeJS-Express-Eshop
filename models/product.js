const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: { 
      type : String,
      required: true,
  },
  price: { 
    type : Number,
    required: true,
  },
  description: { 
    type : String,
    required: true,
  },
  imageUrl: { 
    type : String,
    required: true,
  },
  userId:{
    type : Schema.Types.ObjectId,
    ref: 'User',
    required:true,
  }
});

module.exports = mongoose.model('Product', productSchema);
// const getDb = require('../util/database').getDb
// const mongodb = require('mongodb');

// class Product {
//   constructor(title,price,description,imageUrl,id,userId){
//     this.title= title;
//     this.price= price;
//     this.description= description;
//     this.imageUrl=imageUrl;
//     this._id = id; 
//     this.userId = userId;
//   }

//   save(){
//     const db = getDb();
//     let dpOp;
//     if(this._id){
//       dpOp = db.collection('products').updateOne({_id: new mongodb.ObjectId(this._id)},{$set: {title:this.title,price: this.price, description: this.description, imageUrl:this.imageUrl}});
//     }
//     else{
//       dpOp = db.collection('products').insertOne({title: this.title,price : this.price,description : this.description, imageUrl : this.imageUrl,userId:this.userId});
//     } 
//     return dpOp.then((res)=>{
//     })
//     .catch(err=>console.log(err))
//   }
//   static fetchAll(){
//     const db = getDb();
//     return db
//     .collection('products')
//     .find()
//     .toArray()
//     .then(products => {
//       return products;
//     })
//     .catch(err=>{
//       console.log(err);
//       throw err
//     });
//   }
//   static findById(productId){
//     const db = getDb();
//     return db
//     .collection('products')
//     .find({_id : new mongodb.ObjectId(productId)})
//     .next()
//     .then(product => {
//       return product;
//     })
//     .catch(err=>{
//       console.log(err);
//       throw err
//     });
//   }
//   static removeById(productId){
//     const db = getDb();
//     return db
//     .collection('products')
//     .deleteOne({_id : new mongodb.ObjectId(productId)})
//     .then(result => {
//       return result;
//     })
//     .catch(err=>{
//       console.log(err);
//       throw err
//     });
//   }
// }

// module.exports = Product;