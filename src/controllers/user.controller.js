const asyncHandler = require('../utils/asyncHandler.js');
const ApiError = require('../utils/ApiError');
const User = require('../models/User.model.js');
const uploadToCloudinary = require('../utils/cloudinary.js');
const ApiResponse = require('../utils/ApiResponse.js');

const registerUser = asyncHandler(async (req,res,next)=>{
    const {fullName,email,password,userName} = req.body;
    if([fullName,email,userName,password].some((field)=>field?.trim() === "")){
        throw new ApiError(400,"Please Enter All fields!!");
    }
    
    const existedUser = await User.findOne({
        $or:[{email},{userName}]
    });
    
    if(existedUser){    
        throw new ApiError(409, "User with email or username already exists!");
    }

    const avatarLoaclPath = await req.files.avatar[0].path;

    let coverImageLocalPath;
    
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatarURL = await uploadToCloudinary(avatarLoaclPath);
    if(!avatarURL ){
        throw new ApiError(400,"Avatar file is required!");
    }
    const coverImage = await uploadToCloudinary(coverImageLocalPath);


    const user = await User.create({
        fullName,
        avatar:avatarURL,
        coverImage:coverImage??"",
        email,
        password,
        userName:userName.toLowerCase()
    })

    await user.save();

    const createdUser = await User.findById(user._id).select('-password -refreshToken');

    if(!createdUser) throw new ApiError(500,"Something went wrong while registring the user!");

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registerd successfully!")
    )
});

module.exports = { registerUser }