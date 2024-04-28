const asyncHandler = require('../utils/asyncHandler.js');

const registerUser = asyncHandler((req,res,next)=>{
    res.status(200).json({
        message:"ok"
    });
});

module.exports = { registerUser }