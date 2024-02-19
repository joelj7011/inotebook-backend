const JWT_EXPIRES = "1h";


const sendToken = (token, user, statusCode, res) => {

    const options = {
        expiresIn: JWT_EXPIRES,
        httpOnly: true
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token
    });
}
module.exports = sendToken;


