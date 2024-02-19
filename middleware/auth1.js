const JWT_SECRET = "shivangisagoodboy";
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsyncErrors = require('../Utils/catchAsyncErrors');
const catchErrors = require('../Utils/catchErrors');

const authentication = async (req, res, next) => {
    try {
        const token = req.cookies['auth-token'];

        // const { token } = req.cookies;

        console.log("token->", token);

        if (!token) {
            return catchErrors(401, 'please login', res);
        }

        const decodedData = jwt.verify(token, JWT_SECRET);

        const data = await User.findById(decodedData.user);

        req.user = data.user;

        next();

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }

}

module.exports = authentication;