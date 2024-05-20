const express = require('express');
const { registerUser, loginUser, logouotUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } = require('../controllers/user.controller.js');
const upload = require('../middlewares/multer.middleware.js');
const verifyJWT = require('../middlewares/auth.middleware.js');

const router = express.Router();

router.route('/register').post(upload.fields([
    {
        name:'avatar',
        maxCount:1,
    },
    {
        name:'coverImage',
        maxCount:1,
    }
]),registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT,logouotUser);
router.route('/newrefreshtoken').post(refreshAccessToken);
router.route('/changePassword').post(verifyJWT,changeCurrentPassword);
router.route('/get-current-user').post(verifyJWT,getCurrentUser);
router.route('/update-account-details').patch(verifyJWT,updateAccountDetails);
router.route('/update-avatar').patch(verifyJWT,upload.single('avatar-img'),updateAvatar);
router.route('/update-cover-img').patch(verifyJWT,upload.single('cover-img'),updateUserCoverImage);
router.route('/get-user-channel-profile/:userName').get(verifyJWT,getUserChannelProfile);
router.route('/get-watch-history').get(verifyJWT,getWatchHistory);;

module.exports = router;