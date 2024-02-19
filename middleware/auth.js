const jwt = require('jsonwebtoken');
const JWT_SECRET = "shivangisagoodboy";
const User = require('../models/User');

const authentication0 = async (req, res, next) => {
    try {
        //requesting the header token to identify the user
        //checking if header is correct
        //verifying the token 
        //assigning the token to req.user

        const token = req.cookies['auth-token'];


        if (!token) {
            return res.status(401).send({ error: "please authenticate using a valid token" });
        }


        const data = jwt.verify(token, JWT_SECRET);


        console.log('User information extracted from token:', data.user);


        // const data = await User.findById(decodedata.id);

        req.user = data.user;


        console.log('req.user after assignment:', req.user);


    } catch (error) {
        return res.status(401).send({ error: "please authenticate using a valid token" });
    }

    next();
};


module.exports = authentication0;