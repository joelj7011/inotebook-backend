const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsyncErrors = require('../Utils/catchAsyncErrors');

const authentication = async (req, res, next) => {
    try {

        console.log('|')
        console.log("AUTHENTICATION STARTS");

        const authHeader = req.headers.authorization || req.headers.Authorization;
        const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        const { accessToken } = req.cookies;
        console.log(accessToken,"->",tokenFromHeader);
        if (!accessToken) {
            return res.status(401).json({ message: "no token " });
        }

        const token = tokenFromHeader ?? accessToken;
        if (!token) {
            console.log("Token not found in both authorization header and cookies");
            return res.sendStatus(401);
        }

        let decodedData;
        try {
            decodedData = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Token verified");
        } catch (err) {
            return res.sendStatus(403);
        }

        const data = await User.findById(decodedData.id).select("-password");
        if (!data) {
            console.log("User not found");
            return res.status(401).json({ message: "User not found" });
        }

        req.user = data;

        console.log("Authentication completed");

        next();
    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}

module.exports = authentication;
