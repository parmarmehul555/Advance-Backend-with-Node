const express = require('express');
const { registerUser, loginUser, logouotUser, refreshAccessToken } = require('../controllers/user.controller.js');
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

// router.route('/register').post(upload.single('avatar'),registerUser);

module.exports = router;