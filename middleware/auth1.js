
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsyncErrors = require('../Utils/catchAsyncErrors');
const catchErrors = require('../Utils/catchErrors');

const authentication = async (req, res, next) => {
    try {
        //1.req cookies from the browser
        //2.check token
        //3.if no token return error
        //4.add JWT_SECRET to decodedata
        //5.check decodedata
        //6.find the user id
        //7.assign req.user id

        //1
        const { token } = req.cookies;
        //2
        console.log("token->", token);
        //3
        if (!token) {
            return catchErrors(401, 'please login', res);
        }
        //4
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        //5
        console.log("decodedata->", decodedData);
        //6
        const data = await User.findById(decodedData.id);

        if (!data) {
            throw new Error('no data available');
        }
        //7
        req.user = data;

        next();

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }

}

module.exports = authentication;