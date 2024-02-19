const { validationResult } = require('express-validator');
const User = require('../models/User');
const verifictaiontoken = require('../models/verificationtoken');
const mail = require('../Utils/mail');
const catchAsyncErrors = require('../Utils/catchAsyncErrors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendToken = require('../Utils/sendtoken');
const JWT_SECRET = "shivangisagoodboy";


//------------------------------creating user-------------------------------//
exports.createUser = async (req, res) => {
    try {
        //1.express-validator handling
        //2.generating salt for password
        //3.adding salt to the password 
        //4.creat the user
        //5. prepare the payload for the JSON Web Token that will be used for authentication and authorization.
        //6.create token and pass ,data(user.id),jwt_secret
        //7.send token
        //8.check console

        //1
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).send(errors);
        }

        //2
        const salt = await bcrypt.genSalt(10);

        //3
        const secPass = await bcrypt.hash(req.body.password, salt);

        //4
        const user = await User.create({
            //requesting the credentials from the body(thunderclient)
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        });

        //5
        const data = {
            user: {
                id: user.id,
            }
        }

        //6
        const token = jwt.sign(data, JWT_SECRET);

        //7
        sendToken(token, user, 201, res);
        // res.json({ token });

        //8
        console.log('user-saved', user.name);
    }
    catch (error) {
        catchAsyncErrors(error, req, res);
    }
}




//-----------------------------logging the user-------------------------------//
exports.login = async (req, res) => {
    try {
        //1.express-validator handling
        //2.destructure the email and password
        //3.find the email in the database
        //4.compare the password with the hashed password
        //5.check if the user is valid or not.
        //6.send the payload(token)
        //7.add JWT_secret on the epayload
        //8.send token
        //9.check console

        //1
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
        const data = {
            user: {
                id: user.id,
            }
        }

        //7
        const token = jwt.sign(data, JWT_SECRET);

        //8
        sendToken(token, user, 201, res);


        //9
        console.log("user retreived", user.name);

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }

}


//------------------------fetching the user---------------------------------------------//
exports.getuserdata = async (req, res) => {
    try {

        //assigning req.user.id to a variable
        let userId = req.user.id;

        //fetching the user detail but without password
        const user = await User.findById(userId).select('-password');

        //sending the response
        res.json({ user });

        console.log("data fetched", user.name);

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}



//-------------------------update the user-----------------------------------------------//

exports.UpdateUser = async (req, res) => {

    try {

        //destructure
        const { name, email, password } = req.body;


        //updating the user
        const newUser = {};
        if (name) { newUser.name = name };
        if (email) { newUser.email = email };
        if (password) { newUser.password = password };

        // //find the user by ID
        // const user = await User.findById(req.user.id);


        //find the user and update it 
        const user = await User.findByIdAndUpdate(req.user.id, { $set: newUser }, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

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

        //Allow deletion only if user owns this User
        // if (user.toString() !== req.user.id) {
        //     return res.status(404).send("not found");
        // }

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