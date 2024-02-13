const jwt = require('jsonwebtoken');
const JWT_SECRET = "shivangisagoodboy";


const fetchUser = (req, res, next) => {
    try {
        //requesting the header token to identify the user
        const token = req.header('auth-token');

        //checking if header is correct
        if (!token) {
            return res.status(401).send({ error: "please authenticate using a valid token" });
        }

        //verifying the token 
        const data = jwt.verify(token, JWT_SECRET);


        console.log('User information extracted from token:', data.user);


        //assigning the token to req.user
        req.user = data.user;


        console.log('req.user after assignment:', req.user);


    } catch (error) {
        return res.status(401).send({ error: "please authenticate using a valid token" });
    }

    next();
};


module.exports = fetchUser;