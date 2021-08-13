const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    products: [{
       product: {type: Object, required:true},
       quantity: {type: Number, required: true}
    }],
    user:{
        userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
        },
        email:{type:String,required:true}
    },
    created:{
        type: Date,
        default : Date.now
    }

})
module.exports = mongoose.model('Order', orderSchema)