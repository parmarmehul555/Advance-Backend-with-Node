const app = require("./app");
const connectDB = require("./db");
require('dotenv').config();


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 2005 ,()=>{
        console.log(`Server started at ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MongoDB connection failed!! ",error);
});