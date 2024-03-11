const router = require('express').Router();
const { createUser, login, getuserdata, UpdateUser, Deletetheuser, verifyUser, logout } = require('../controllers/userControllert');
const { body } = require('express-validator');
const authentication = require('../middleware/auth1');




//NO-LOGIN
router.post('/createuser', [
    body('name').custom((value) => {

        if (!value || value.trim().length <= 3) {
            throw new Error("Name is too short");
        }
        return true;

    }).withMessage("Name is too short"),

    body('email').isEmail().withMessage("Invalid email address"),

    body('password').isLength({ min: 5 }).withMessage("Password is too short"),
], createUser);

//NO_LOGIN
router.post('/verifyuser/:id', verifyUser);

//NO-LOGIN
router.post('/login', [
    body('email').custom((value) => {

        if (!value) {
            throw new Error("email is required");

        } else if (value.length <= 3 || value.isempty) {
            throw new Error("email is too small");
        }
        return true;
    }).isEmail().withMessage("Null value not acceptable or email is too short"),

    body('password').custom((password) => {
        if (!password) {
            throw new Error("password is required");

        } else if (password.length <= 3 || password.isempty) {
            throw new Error("password is to short");
        }
        return true;
    }).exists().withMessage('Null value not acceptable or password is too short'),
], login);



router.post('/getuser', authentication, getuserdata);

router.put('/updateuser', authentication, UpdateUser);

router.delete('/deleteuser', authentication, Deletetheuser);

router.post('/logout', logout);

module.exports = router;