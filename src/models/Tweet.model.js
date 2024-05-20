const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
    content:{
        type:String,
        required:true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }
},{timestamps:true});

module.exports = mongoose.model('Tweet',tweetSchema);