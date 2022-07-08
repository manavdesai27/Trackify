const router = require('express').Router();
const {
    registerUser,
    loginUser,
    getUser,
    validateToken,
} = require('../controllers/user.controller');

const auth = require('../middleware/auth');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.get("/", auth, getUser);
router.route("/tokenIsValid").post(validateToken);


module.exports = router;