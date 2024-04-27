const mongoose = require('mongoose');

const connectDB = async () =>{
    try {
        const connectionInstance = mongoose.connect(process.env.MONGODB_URI);
        console.log('Mongo db connected!!');
    } catch (error) {
        console.log("Can not connect to MongoDB ==>> ",error);
        process.exit(1);
    }
}

module.exports = connectDB;