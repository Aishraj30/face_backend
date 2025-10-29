const mongoose = require('mongoose')

const userschema = new mongoose.Schema({

    fullname:{
        requires:true,
        type:String,

    },

    email:{
        required:true,
        unique:true,
        type:String,

    },
   
    image: {
      type: String,
    //   required: true,
    }


})

const usermodel = mongoose.model(  'user ' , userschema)

module.exports = usermodel