const express = require('express');
const { registerUser } = require('../controllers/user.controller.js');
const upload = require('../middlewares/multer.middleware.js');

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

// router.route('/register').post(upload.single('avatar'),registerUser);

module.exports = router;