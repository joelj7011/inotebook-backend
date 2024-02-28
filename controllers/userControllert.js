const { validationResult } = require('express-validator');
const User = require('../models/User');
const VerificationToken = require("../models/Verification");
const catchAsyncErrors = require('../Utils/catchAsyncErrors');
const bcrypt = require('bcryptjs');
const { generateOtp, mailTransport } = require('../Utils/otpGenerator');
const { sendToken } = require('../Utils/sendtoken');
const catchErrors = require('../Utils/catchErrors');



//------------------------------creating user-------------------------------//
exports.createUser = async (req, res) => {
    let user;
    try {
        const timeout = process.env.JWT_EXPIRES;


        //previous-algo
        //1.express-validator handling
        //2.generating salt for password
        //3.adding salt to the password 
        //4.creat the user
        //5. prepare the payload for the JSON Web Token that will be used for authentication and authorization.
        //6.create token and pass ,data(user.id),jwt_secret
        //7.send token
        //8.check console

        //new-algo
        //1.express-validator handling
        //2.generating salt for password
        //3.adding salt to the password 
        //4.creat the user
        //5.generating the otp
        //6.creating the verification token
        //7.sending email for verification to the user
        //8.checking if the user is verified 
        //9.ending the token

        //1
        const errors = validationResult(req);
        console.log("test1")

        if (!errors.isEmpty()) {
            return res.status(400).send(errors);
        }

        //2
        const salt = await bcrypt.genSalt(10);
        console.log('salt->', salt);

        //3
        const secPass = await bcrypt.hash(req.body.password, salt);
        console.log("secPass", secPass)

        //4
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
            isVerified: false
        });

        //5
        const OTP = await generateOtp();
        console.log("OTP->", OTP);

        //6
        const verificationToken = await VerificationToken.create({
            owner: user.id,
            verifyToken: OTP,
        });
        console.log("verificationToken->", verificationToken);

        //7
        mailTransport().then(async(transporter) => {
            try {
                const info = await transporter.sendMail({
                    from: "shivangtiwari7011@gmail.com",
                    to: user.email,
                    subject: "verify your email account",
                    html: `<h1>${OTP}</h1>`,
                });
                console.log("info->",info)
                console.log("Email sent:", info.response);

            } catch (error) {
                console.error("Error sending email:", error);
            }
        });



        //8
        setTimeout(() => {
            if (user.isVerified === false) {
                res.json({ user: "not verifird" })
            }
            else if (user.isVerified === true) {
                res.json({ user: "verifird" });
            }
        }, timeout);


        setTimeout(async () => {
            user = await User.findByIdAndDelete(req.user.id);
        }, timeout)

        console.log("user-deleted", user.email);

        //9
        if (user.isVerified === true) {
            sendToken(user, 200, res)
        }


        console.log('user-saved', user.name);
    }
    catch (error) {
        catchAsyncErrors(error, req, res);
    }
}




//-----------------------------logging the user-------------------------------//
exports.login = async (req, res) => {
    try {

        // previous algo without token
        //1.express-validator handling
        //2.destructure the email and password
        //3.find the email in the database
        //4.compare the password with the hashed password
        //5.check if the user is valid or not.
        //6.send the payload(token)
        //7.add JWT_secret on the epayload
        //8.send token
        //9.check console


        //curent algo with token
        //1.express-validator handling
        //2.destructure the email and password
        //3.find the email in the database
        //4.compare the password with the hashed password
        //5.check if the user is valid or not.
        //6.sendtoken

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors });
        }

        //2
        const { email, password } = req.body;

        //3
        let user = await User.findOne({ email });


        //4
        const passwordCompare = await bcrypt.compare(password, user.password);

        //5 
        if (!passwordCompare) {
            return res.status(400).json({ error: 'please login with correct credentials' });
        }

        //6
        if (user.isVerified === true) {
            sendToken(user, 200, res);
        } else {
            sendToken(null, 200, res);
            res.json({ user: "this user is not verified" });
        }


        console.log("user retreived", user.name);

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }

}


//------------------------fetching the user---------------------------------------------//
exports.getuserdata = async (req, res) => {
    try {

        //1.assigning req.user.id to a variable
        //2.fetching the user detail but without password
        //3.fetching the user detail but without password

        //1
        let userId = req.user.id;

        //2
        const user = await User.findById(userId).select('-password');

        //3
        res.json({ user });

        console.log("data fetched", user.name);

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}

//-------------------------update the user-----------------------------------------------//

exports.UpdateUser = async (req, res) => {

    try {

        //1.destructure
        //2.updating the user
        //3.find the user and update it 
        //4.send the response

        //1
        const { name, email, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        console.log("salt->", salt)
        const secpass = await bcrypt.hash(req.user.password, salt);
        //2
        const newUser = {};
        if (name) { newUser.name = name };
        if (email) { newUser.email = email };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            console.log("salt->", salt)
            const hashedPassword = await bcrypt.hash(req.user.password, salt);
            console.log('hashedPassword->', hashedPassword);
            newUser.password = hashedPassword
        };

        let user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).send("not found");
        }

        // 3
        user = await User.findByIdAndUpdate(req.user.id, { $set: newUser }, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
        //4
        console.log("user updated", user.name);

        res.json({ user });

        // //The way iam  checking user.toString() !== req.params.id it`s incorrect because it is comparing the user document (after finding by ID) to the string representation of the request parameter (req.params.id). This condition would always evaluate to true, leading to the "not found" response.--//////
        // if (!user) {
        //     return res.status(404).send("not found");
        // }
        // if (user.toString() !== req.params.id) {
        //     return res.status(404).send("not found");
        // }

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}


//-----------------delete the user--------------------------------//
exports.Deletetheuser = async (req, res) => {
    try {



        //find the user and delete it 
        // let user = await User.findById(req.user.id);
        // if (!user) { return res.status(404).send("not found"); }

        //delete the user
        const user = await User.findByIdAndDelete(req.user.id, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
        console.log("user deleted", user.name);


        return res.status(200).json({
            success: true,
            user: user,
        });

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }

}

exports.logout = (req, res) => {
    try {

    } catch (error) {

    }
}