const asyncHandler = require('../utils/asyncHandler.js');
const ApiError = require('../utils/ApiError');
const User = require('../models/User.model.js');
const uploadToCloudinary = require('../utils/cloudinary.js');
const ApiResponse = require('../utils/ApiResponse.js');
const jwt = require('jsonwebtoken');

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Somthing went wrong while generating access and refresh token!");
    }
}

const registerUser = asyncHandler(async (req, res, next) => {
    const { fullName, email, password, userName } = req.body;
    if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Please Enter All fields!!");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { userName }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists!");
    }

    const avatarLoaclPath = await req.files.avatar[0].path;

    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatarURL = await uploadToCloudinary(avatarLoaclPath);
    if (!avatarURL) {
        throw new ApiError(400, "Avatar file is required!");
    }
    const coverImage = await uploadToCloudinary(coverImageLocalPath);


    const user = await User.create({
        fullName,
        avatar: avatarURL,
        coverImage: coverImage ?? "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    await user.save();

    const createdUser = await User.findById(user._id).select('-password -refreshToken');

    if (!createdUser) throw new ApiError(500, "Something went wrong while registring the user!");

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registerd successfully!")
    )
});

const loginUser = asyncHandler(async (req, res, next) => {
    const { userName, email, password } = req.body;
    if (!(userName || email)) throw new ApiError(400, "username or email is required!");

    const user = await User.findOne({ $or: [{ userName }, { email }] });

    if (!user) throw new ApiError(404, "User does not exist!");

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) throw new ApiError(401, "Invalid User Credentials!");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedinUser = await User.findById(user._id).select('-password -refreshToken');

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedinUser, accessToken, refreshToken
            },
                "User Logged In successfully"
            )
        );

});

const logouotUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            },
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, "User Logout Successfully!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) throw new ApiError(401, 'Unauthorised request!');

    try {
        const decodedToken = jwt.verify(refreshAccessToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) throw new ApiError(401, 'Invalid Refresh Token!');

        if (incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, "Refresh token is expired or used!");

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user?._id);

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie('accessToken', accessToken)
            .cookie('refreshToken', newRefreshToken)
            .json(
                new ApiResponse(200, { accessToken, newRefreshToken }, "Access Token refreshed!")
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPsswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPsswordCorrect) throw new ApiError(400, "Invalid Old Password");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password change successfully!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError(401, "Unauthorized request!");
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User Fetched Successfully!"));
});

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath) throw ApiError(400,"Avatar File Is missing");

    const avatarURL = await uploadToCloudinary(avatarLocalPath);

    if(!avatarURL) throw new ApiError(400,"Error while updating Avatar!");  

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatarURL
            }
        },
        {new:true}
    ).select('-password');

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar Updated Successfully!"));
});

const updateUserCoverImage = asyncHandler(async (req,res)=>{
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath) throw ApiError(400,"Avatar File Is missing");

    const coverImageURL = await uploadToCloudinary(coverImageLocalPath);

    if(!coverImageURL) throw new ApiError(400,"Error while updating Avatar!");  

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImageURL
            }
        },
        {new:true}
    ).select('-password');

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover Image Updated Successfully!"));
});

module.exports = { registerUser, loginUser, logouotUser, refreshAccessToken, changeCurrentPassword, getCurrentUser,updateAccountDetails,updateAvatar,updateUserCoverImage }