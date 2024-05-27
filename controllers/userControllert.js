const { validationResult } = require('express-validator');
const User = require('../models/User');
const VerificationToken = require("../models/Verification");
const catchAsyncErrors = require('../Utils/catchAsyncErrors');
const bcrypt = require('bcryptjs');
const { generateOtp, mailTransport } = require('../Utils/otpGenerator');
const { sendToken, generateAccessToken } = require('../Utils/sendtoken');
const catchErrors = require('../Utils/catchErrors');
const jwt = require('jsonwebtoken');
const { options } = require('../constants');
const ApiResponse = require('../Utils/ApiResponse');
const Notes = require('../models/Notes');


exports.createUser = async (req, res) => {

    try {
        const errors = validationResult(req);
        if (errors) {
            console.log("test-1-passed");
        } else {
            console.log("test-1-failed");
        }

        if (!errors.isEmpty()) {
            return res.status(400).send(errors);
        }
        if (errors) {
            console.log("test-2-passed");
        } else {
            console.log("test-2-failed");
        }

        const user = await User.create({
            name: req.body.name,
            password: req.body.password,
            email: req.body.email,
        });
        if (user) {
            console.log("test-3-passed");
        } else {
            console.log("test-3-failed");
            return res.status(500).json({ error: "user was not created" });
        }

        const Signed = await user.sign_password(user.password);
        if (Signed) {
            console.log("test4->passed");
        } else {
            console.log("test4->failed");
            return res.status(500).json({ error: "password was not signed" });
        }

        const OTP = await generateOtp();
        if (OTP) {
            console.log("test-5-passed");
        } else {
            console.log("test-5-failed");
        }

        const verificationToken = await VerificationToken.create({
            owner: user.id,
            verifyToken: OTP,
        });
        if (verificationToken) {
            console.log("test-6-passed");
        } else {
            console.log("test-6-failed");
        }

        const SignOtp = await verificationToken.signOtp(OTP);
        if (SignOtp) {
            console.log("test-7-passed");
        } else {
            console.log("test-7-failed");
        }

        mailTransport().then((transporter) => {
            transporter.sendMail({
                from: "shivanggtiwari7011@gmail.com",
                to: user.email,
                subject: "Verify your email account",
                html: `<h1>${OTP}</h1>`,
            }).then((info) => {
                console.log("Email sent:", info.response);
            }).catch((error) => {
                if (!error) {
                    console.log("test-8-passed");
                } else {
                    console.log("test-8-failed");
                    return res.status(401).json({ message: `internet connection not available${error.message}` });
                }
            })
        });

        if (!user.verified) {
            return res.json({
                message: `Email sent to ${user.name}. Please verify your account`,
                user
            });
        }

        setTimeout(async () => {
            if (!user.verified) {
                await User.findByIdAndDelete(user.id, {
                    new: true,
                    runValidators: true,
                    useFindAndModify: false,
                });
            }
        }, process.env.JWT_EXPIRES);
        console.log('all test passed');
    }

    catch (error) {
        catchAsyncErrors(error, req, res);
    }
}


exports.sendVerificationAgain = async (req, res) => {
    try {

        const user = await User.findById(req.params.id);
        if (!user) {
            console.log("test1-> failed")
            return res.status(401).json({ message: "user not found" });
        } else {
            console.log("test1-> passed")
        }

        if (user.verified) {
            console.log("test2-> failed");
            return res.json({ message: `${user} already verified` });
        } else {
            console.log("test2-> passed")
        }

        const OTP = await generateOtp();
        if (OTP) {
            console.log("test3-> passed");
        } else {
            console.log("test3-> failed");
            return res.status(404).json({ message: "problem generating OTP" });
        }

        const verifyemail = await VerificationToken.findOne({ owner: user.id });
        if (!verifyemail) {
            console.log("test4-> failed")
            return res.status(404).json({ message: "Verification token not found" });
        } else {
            console.log("test4-> passed")
        }

        const SignOtp = await verifyemail.signOtp(OTP);
        if (SignOtp) {
            console.log("test5-> passed")
        } else {
            console.log("test5-> failed")
            return res.status(404).json({ message: "SignOtp method is not working" });
        }

        const transporter = await mailTransport();
        const info = await transporter.sendMail({
            from: "akash@blueorb.in",
            to: user.email,
            subject: "Verify your email account",
            html: `<h1>${OTP}</h1>`,
        });

        console.log("Email sent:", info.response);

        if (mailTransport()) {
            console.log("test5-> success")
        } else {
            console.log("test5-> failed")
        }

        res.status(200).json({ message: "otp send to the the user successfully " });
    } catch (error) {

        catchAsyncErrors(error, req, res);
    }

}


exports.verifyUser = async (req, res) => {
    try {

        const { OTP } = req.body;
        if (OTP) {
            console.log("test1-> success")
        } else {
            console.log("test1-> failed")
        }


        const user = await User.findById(req.params.id);
        if (!user) {
            console.log("test2-> failed");
            return res.status(404).json({ success: false, message: "User not found" });
        } else {
            console.log("test2-> success");
        }


        const verifyemail = await VerificationToken.findOne({ owner: user.id });
        if (!verifyemail) {
            console.log("test3-> failed");
            return res.status(404).json({ success: false, message: "Verification token not found" });
        } else {
            console.log("test3-> success");
        }

        const token = await verifyemail.compare(OTP);
        if (!token) {
            console.log("test3-> success");
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        } else {
            console.log("test3-> failed");
        }


        user.verified = true;
        if (user.verified) {
            console.log("test4-> success");
        } else {
            console.log("test4-> failed");
        }


        await user.save();
        if (user.save()) {
            console.log("test4-> success");
        } else {
            console.log("test4-> failed");
        }


        await VerificationToken.findByIdAndDelete(verifyemail.id);
        if (VerificationToken) {
            console.log("test5-> success");
        } else {
            console.log("test5-> failed");
        }


        mailTransport().then((transporter) => {
            transporter.sendMail({
                from: "shivanggtiwari7011@gmail.com",
                to: user.email,
                subject: "Email account verified",
                html: `Congratulations! Your email account has been verified.`,
            }).then((info) => {
                console.log("Email sent:", info.response);
            }).catch((error) => {
                if (!error) {
                    console.log("test5-> failed");
                } else {
                    console.log("test5-> success");
                }

                console.error("Error sending email:", error);
            });
        });


        res.status(200).json({ success: true, message: "Email account verified successfully" });
        console.log("all test passed->verification ends");

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}


exports.login = async (req, res) => {

    try {

        const errors = validationResult(req);
        if (errors) {
            console.log("test-1-success");
        } else {
            console.log("test-1-failed");
        }


        if (!errors.isEmpty()) {
            console.log("test-2-failed");
            return res.status(400).json({ errors });
        } else {
            console.log("test-2-success ");
        }


        const { email, password } = req.body;
        if (!email && !password) {
            console.log("test3-> failed")
            return res.status(400).json({ message: "email and password not avaialable" });
        } else {
            console.log("test3-> success")
        }


        const user = await User.findOne({ email: email });
        if (!user) {
            console.log("test4-> failed");
            return res.status(400).json({ message: "user not found" });
        } else {
            console.log("test4-> success");
        }


        const passwordCompare = await user.isPasswordCorrect(password);
        if (!passwordCompare) {
            console.log("test5-> failed");
            return res.status(401).json({ message: 'please login with correct credentials' });
        } else {
            console.log("test5-> success");
        }

        const loggedInUser = await User.findById(user.id).select("-password -__v -date -verified  -refreshToken");
        if (!loggedInUser) {
            console.log("test6-> failed");
            return res.status(400).json({ error: "no user found" });
        } else {
            console.log("test6->success")
        }


        if (!user.verified) {
            console.log("test7->failed");
            return res.json("please verify first");
        } else {
            console.log("test7->success");
        }


        const { accessToken, refreshToken } = await generateAccessToken(user.id);
        if (!accessToken || !refreshToken) {
            console.log("test8-> failed");
            return res.status(400).json({ error: 'no token found' });
        } else {
            console.log("test8->success")
        }

        console.log('all test passed-user logged in');
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "user logged in succesfully"));


    } catch (error) {
        catchAsyncErrors(error, req, res);
    }

}

exports.GenerateOtp = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (errors) {
            console.log("test-1-success");
        } else {
            console.log("test-1-failed");
        }

        if (!errors.isEmpty()) {
            console.log("test-2-failed");
            return res.status(400).json({ errors });
        } else {
            console.log("test-2-success ");
        }

        const { email } = req.body;
        console.log(email)
        if (!email) {
            console.log("test3->failed");
            return res.status(500).json({ errro: "email and otp not found" });
        } else {
            console.log("test3->success");
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            console.log("test4->failed");
            return res.status(500).json({ errro: "user not found" });
        } else {
            console.log("test4->success");
        }

        const OTP = await generateOtp();
        if (OTP) {
            console.log("test3-> passed");
            user.otp = OTP;
            console.log(user.otp);
        } else {
            console.log("test3-> failed");
            return res.status(404).json({ message: "problem generating OTP" });
        }

        if (!user.verified) {
            console.log("test5->failed");
            return res.status(401).json({ error: "please verify first" });
        } else {
            console.log("test5->success");
        }

        const hashed = await user.sign_Otp(OTP);
        if (hashed) {
            console.log(user.otp);
            console.log("test6->passed");
        } else {
            console.log("test6->failed");
            return res.status(500).json({ error: "could not hash the OTP" });
        }

        mailTransport().then((transporter) => {
            transporter.sendMail({
                from: "akash@blueorb.in",
                to: user.email,
                subject: "Verify your email account",
                html: `<h1>${OTP}</h1>`,
            }).then((info) => {
                console.log("Email sent:", info.response);
            }).catch((error) => {
                if (!error) {
                    console.log("test-7-passed");
                } else {
                    console.log("test-7-failed");
                    return res.status(401).json({ message: `internet connection not available${error.message}` });
                }
            })
        });

        console.log('all test passed-user logged in');
        return res.json({ message: "otp generated" });

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}

exports.loginWithOtp = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (errors) {
            console.log("test-1-success");
        } else {
            console.log("test-1-failed");
        }

        if (!errors.isEmpty()) {
            console.log("test-2-failed");
            return res.status(400).json({ errors });
        } else {
            console.log("test-2-success ");
        }


        const { email, OTP } = req.body;
        console.log(email);
        console.log(OTP);
        if (!email || !OTP) {
            console.log("test3->failed");
            return res.status(500).json({ errro: "email and otp not found" });
        } else {
            console.log("test3->success");
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            console.log("test4->failed");
            return res.status(401).json({ errro: "user not found" });
        } else {
            console.log("test4->success");
        }

        const otpCompare = await user.isOtpCorrect(OTP);
        if (!otpCompare) {
            console.log("test6-> failed");
            return res.status(400).json({ error: 'problem with the OTP' });
        } else {
            console.log("test6-> success");
        }

        if (!user.verified) {
            console.log("test7->failed");
            return res.status(402).json({ error: "please verify first" });
        } else {
            console.log("test7->success");
        }

        const deleteOtp = await User.findByIdAndUpdate(user.id, { $unset: { otp: true } }, { new: true });
        if (!deleteOtp) {
            console.log("test-8-> failed");
            return res.status(500).json({ error: "otp was not deleted" });
        } else {
            console.log("test8->success");
        }

        const { accessToken, refreshToken } = await generateAccessToken(user.id);

        if (user.verified) {
            console.log('all test passed-user logged in');
            return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, { user: user, accessToken, refreshToken }, "user logged in succesfully"));
        }


    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}


exports.getuserdata = async (req, res) => {
    try {
        console.log("GET--USER STARTS");
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password -_id -__v -date ");
        if (user) {
            console.log("test1-> success");
        } else {
            console.log("test1-> failed");
        }

        if (!user.verified) {
            console.log("test2-> failed");
            return res.status(500).json({
                message: "verify first"
            })
        } else {
            console.log("test2-> success");
            console.log("all test passed-data fetched ")
            console.log("GET--USER STARTS");
            return res.json(new ApiResponse(200, { user: user }, "user data fteched succefully"));
        }

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}


exports.UpdateUser = async (req, res) => {
    try {

        const { name, email, } = req.body;
        if (!email && !name) {
            console.log("test1-> failed")
        } else {
            console.log("test1-> success")
        }


        const newUser = {};
        if (name) { newUser.name = name };
        if (email) { newUser.email = email };
        if (newUser) {
            console.log("test2-> success")
        } else {
            console.log("test2-> failed")
        }

        let user = await User.findById(req.user.id);
        if (!user) {
            console.log('test3->success')
            return catchErrors(404, 'not found', res);
        } else {
            console.log("test3-> failed")
        }

        user = await User.findByIdAndUpdate(req.user.id, { $set: newUser }, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }).select(" -_id -password -date -verified -__v");

        console.log("user updated", user.name);
        res.json({ user });

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}

exports.Deletetheuser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        console.log(user.id);
        if (user) {
            console.log("test1->success");
        } else {
            console.log("test1->dailed");
            return res.json(new ApiResponse(500, { user: null }, "user could not found"));
        }

        const findnotes = await Notes.find({ user: req.user.id });
        if (findnotes) {
            console.log("test2->success");
        } else {
            console.log("test2->failed");
            return res.json(new ApiResponse(500, { notes: null }, "notes could not found"));
        }

        const delNotes = await Notes.deleteMany({ user: req.user.id }, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        })
        if (delNotes) {
            console.log("test4->success");
        } else {
            console.log("tes5->failed");
            return res.json(new ApiResponse(500, { notes: null }, "notes could not be deleted"));
        }

        const delUser = await User.findByIdAndDelete(user.id, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
        if (delUser) {
            console.log("test3->success");
        } else {
            console.log("test3->success");
            return res.json(new ApiResponse(500, { user: delUser }, "user could not be deleted"));

        }

        if (delUser && delNotes) {
            return res.json(new ApiResponse(200, { user: null, notes: null }, "user deleted successfully"));
        }

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }

}

exports.changepassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors });
        }
        console.log("test");
        const { oldpassword, newPassword } = req.body;
        console.log("test-1");

        const user = await User.findById(req.user.id);
        if (!user) {
            return catchErrors(401, "problem occured", res);
        }
        console.log("test-2");

        if (oldpassword === newPassword) {
            return res.status(401).send({ message: "choose a new and strong password" });
        }

        const passwordCompare = await user.isPasswordCorrect(newPassword);
        if (passwordCompare) {
            console.log(newPassword);
            return res.status(401).send({ message: `you enterd an old password ` });
        }
        console.log("test-3");

        const hashedPassword = await user.sign_password(newPassword);
        console.log("test-4");
        if (hashedPassword) {
            return res
                .status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json(new ApiResponse(200, {}, `Password updated for ${user.name}`));
        }

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}

exports.logout = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            console.log("test1->failed");
            return res.status(500).json({ error: "user not found" });
        } else {
            console.log("test1->success");
        }

        const userExsist = await User.findByIdAndUpdate(user.id, { $unset: { refreshToken: 1 } }, { new: true });
        if (!userExsist) {
            console.log("test2->failed");
            return res.status(500).json({ message: "user does not exist" })
        } else {
            console.log("test2->success");
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out Successfully"));

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}

exports.refreshAcessToken = async (req, res) => {
    try {

        console.log("|")
        console.log("refreshtoken starts");

        const refreshAccessToken = await req.cookies.refreshToken;
        if (!refreshAccessToken) {
            console.log("test1->passed");
            return res.status(401).json({ message: "you need to be logged in" });
        }

        let decodedToken;
        try {
            decodedToken = await jwt.verify(refreshAccessToken, process.env.REFRESH_TOKEN_SECRET);
            console.log("test2 -> passed");
        } catch (err) {
            console.log("test2->failed");
            return res.status(500).json({ error: "verification failed" });
        }

        const user = await User.findById(decodedToken?.id);
        if (!user) {
            console.log("test3->failed");
            return res.status(500).json({ error: "user not found" });
        } else {
            console.log("test3->passed");
        }

        if (refreshAccessToken !== user?.refreshToken) {
            console.log("test4->failed");
            return res.status(500).json({ error: "incoming refresh token is not matching" });
        } else {
            console.log("test4->passed");
        }

        const { accessToken, refreshToken } = await generateAccessToken(user.id);

        console.log("REFRESH--TOKEN STARTS");
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Token refreshed successfully"
            ));
    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}
