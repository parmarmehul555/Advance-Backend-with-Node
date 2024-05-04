const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUDNAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_SECRET
// });

cloudinary.config({
    cloud_name: 'de0punalk',
    api_key: '832251157443793',
    api_secret: 'Gm8NN181rgEqpGrQA2ZCg9MyctA'
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        const result = await cloudinary.uploader.upload(localFilePath,
            { resource_type: 'auto' });
            fs.unlinkSync(localFilePath);

        return result.secure_url;

    } catch (error) {
        console.log("ERROR while uploaing to cloudinary is ",error);
    }
}

module.exports = uploadOnCloudinary;