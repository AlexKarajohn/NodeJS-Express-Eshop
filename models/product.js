const getDb = require('../util/database').getDb
const mongodb = require('mongodb');

class Product {
  constructor(title,price,description,imageUrl,id){
    this.title= title;
    this.price= price;
    this.description= description;
    this.imageUrl=imageUrl;
    this._id = new mongodb.ObjectId(id);
  }

  save(){
    const db = getDb();
    let dpOp;
    if(this._id){
      dpOp = db.collection('products').updateOne({_id: this._id},{$set: this});
    }
    else{
      dpOp = db.collection('products').insertOne(this);
    } 
    return dpOp.then((res)=>{
      console.log(res);
    })
    .catch(err=>console.log(err))
  }
  static fetchAll(){
    const db = getDb();
    return db
    .collection('products')
    .find()
    .toArray()
    .then(products => {
      console.log(products);
      return products;
    })
    .catch(err=>{
      console.log(err);
      throw err
    });
  }
  static findById(productId){
    const db = getDb();
    return db
    .collection('products')
    .find({_id : new mongodb.ObjectId(productId)})
    .next()
    .then(product => {
      console.log(product);
      return product;
    })
    .catch(err=>{
      console.log(err);
      throw err
    });
  }
  static removeById(productId){
    const db = getDb();
    return db
    .collection('products')
    .remove({_id : new mongodb.ObjectId(productId)})
    .then(result => {
      console.log(result);
      return result;
    })
    .catch(err=>{
      console.log(err);
      throw err
    });
  }
}

module.exports = Product;