const User = require("../models/User");

// exports.sendToken = (user, statusCode, res) => {
//     //1.getjwtToken from the user model
//     //2.check the token
//     //3.create option pass the expery date of the token
//     //4.check options
//     //5.send cookie

//     //1
//     const token = user.getJwtToken()
//     //2
//     console.log("token", token)
//     //3
//     const options = {
//         expiresIn: process.env.JWT_EXPIRES,
//         httpOnly: true
//     };
//     //4
//     console.log("options", options)
//     //5
//     res.status(statusCode).cookie('token', token, options).json({
//         success: true,
//         user,
//         token
//     });
// }

exports.generateAccessToken = async (userId) => {
    try {
        console.log('GENERATING TOKEN STARTS');

        const user = await User?.findById(userId);
        if (!user) {
            console.log("test1->failed")
        } else {
            console.log("test1->success")

        }

        const accessToken = user?.generateAccessToken();
        if (!accessToken) {
            console.log("test2->failed")
        } else{
            console.log("test2->success")
        }

        const refreshToken = user?.generateRefreshToken();
        if (!refreshToken) {
            console.log("test3->failed")
        } else {
            console.log("test3->success")
        }

        user.refreshToken = refreshToken;
        if (!user.refreshToken) {
            console.log("test4->failed")
        } else {
            console.log("test4->success")
        }

        await user.save({ validateBeforeSave: false });

        console.log("all test passed");

        console.log('GENERATING TOKEN ENDS');
        return { accessToken, refreshToken };

    } catch (error) {
        console.log("error occured");
    }
}
