const JWT_EXPIRES = "1h";
exports.sendToken = (user, statusCode, res) => {
    //1.getjwtToken from the user model
    //2.check the token
    //3.create option pass the expery date of the token
    //4.check options
    //5.send cookie

    //1
    const token = user.getJwtToken()
    //2
    console.log("token", token)
    //3
    const options = {
        expiresIn: JWT_EXPIRES,
        httpOnly: true
    };
    //4
    console.log("options", options)
    //5
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token
    });
}



