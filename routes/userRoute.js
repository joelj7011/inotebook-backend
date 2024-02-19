const router = require('express').Router();
const { createUser, login, getuserdata, UpdateUser, Deletetheuser } = require('../controllers/userControllert');
const { body } = require('express-validator');
const authentication0 = require('../middleware/auth');
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

router.put('/updateuser/:id', authentication, UpdateUser);

router.delete('/deleteuser/:id', authentication, Deletetheuser);



module.exports = router;