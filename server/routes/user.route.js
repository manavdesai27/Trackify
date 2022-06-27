const router = require('express').Router();
const {
    registerUser,
    loginUser,
    getUser,
} = require('../controllers/user.controller');

const auth = require('../middleware/auth');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/').get(auth, getUser);

module.exports = router;