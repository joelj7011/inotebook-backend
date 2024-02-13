const { validationResult } = require('express-validator');
const User = require('../models/User');
const catchAsyncErrors = require('../Utils/catchAsyncErrors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "shivangisagoodboy";


//------------------------------creating user-------------------------------//
exports.createUser = async (req, res) => {
    try {
        //validation error handling
        //create salt
        //add hash
        //create a new user
        //send id as token
        //create token

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).send(errors);
        }

        const salt = await bcrypt.genSalt(10);

        const secPass = await bcrypt.hash(req.body.password, salt);

        let user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        });

        const data = {
            user: {
                id: user.id,
            }
        }

        const token = jwt.sign(data, JWT_SECRET);

        res.json({ token });

        console.log('user-saved', user.email);
    }
    catch (error) {
        catchAsyncErrors(error, req, res);
    }
}



//-----------------------------logging the user-------------------------------//
exports.login = async (req, res) => {
    try {

        //validation error handling
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors });
        }

        //taking out email password from req.body
        const { email, password } = req.body;

        //finding the email in databae
        let user = await User.findOne({ email });

        //comparing password with the hash of the previously stored password
        const passwordCompare = await bcrypt.compare(password, user.password);

        //checking if user is a valid user or not 
        if (!passwordCompare) {
            return res.status(400).json({ error: 'please login with correct credentials' });
        }

        //if the user is valid fetching the user crdentials back from the database through id
        const data = {
            user: {
                id: user.id,
            }
        }

        //creating token and passing ,data(user.id),jwt_secret
        const token = jwt.sign(data, JWT_SECRET);

        //sending token
        res.json({ token });

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
        res.send(user)

        console.log("data fetched", user.name);

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}



//-------------------------update the user-----------------------------------------------//

exports.UpdateUser = async (req, res) => {

    try {

        //destructure requaest body
        //generate salt and hash password
        //create new user object(update-logic)
        // Find user by ID and update
        const errors = validationResult(req);


        if (errors.isEmpty()) {
            return res.status(400).json({ errors });
        }
        //1
        const { name, email, password } = req.body;

        //2
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //3
        const newUser = {};
        if (name) { newUser.name = name };
        if (email) { newUser.email = email };
        if (hashedPassword) { newUser.password = hashedPassword };

        //4
        const user = await User.findByIdAndUpdate(req.user.id, { $set: newUser }, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        console.log("user updated", user.name);

        return res.status(200).json({
            success: true,
            user: user,
        })

        // //The way iam  checking user.toString() !== req.params.id it`s incorrect because it is comparing the user document (after finding by ID) to the string representation of the request parameter (req.params.id). This condition would always evaluate to true, leading to the "not found" response.--//////
        // if (!user) {
        //     return res.status(404).send("not found");
        // }
        // if (user.toString() !== req.params.id) {
        //     return res.status(404).send("not found");
        // }

    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
}


//-----------------delete the user--------------------------------//
exports.Deletetheuser = async (req, res) => {
    try {
        // Find the user and delete it
        const user = await User.findByIdAndDelete(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log("User deleted:", user.name);

        return res.status(200).json({ success: true, user: user });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

