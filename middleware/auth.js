const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsyncErrors = require('../Utils/catchAsyncErrors');

const authentication0 = async (req, res, next) => {
    try {
        //requesting the header token to identify the user
        //checking if header is correct
        //verifying the token 
        //assigning the token to req.user

        const token = req.header('auth-token');

        console.log("token->", token)

        if (!token) {
            return res.status(401).send({ error: "please authenticate using a valid token" });
        }

        const decodedata = jwt.verify(token, process.env.JWT_SECRET);

        console.log("decodedata", decodedata);

        if (!decodedata) {
            return res.status(401).send({ error: "Invalid token format" });
        }

        console.log("data->", decodedata)

        console.log('User information extracted from token:', decodedata);

        req.user = decodedata;


        console.log('req.user after assignment:', req.user);


    } catch (error) {
          
        return res.status(401).send({ error: "please authenticate using a valid token" });
     
    }

    next();
};


module.exports = authentication0;