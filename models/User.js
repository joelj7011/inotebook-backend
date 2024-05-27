const mongoose = require('mongoose');
const { Schema } = mongoose;
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    verified: {
        type: Boolean,
        default: false,
        required: true
    },
    refreshToken: {
        type: String,
    },
    otp: {
        type: String,
    }
});

// UserSchema.pre('save', async function (next) {
//     if (!this.isModified("password")) {
//         return next();
//     }

//     const addSalt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(this.password, addSalt);
//     this.password = hashedPassword;

// });

UserSchema.methods.sign_password = async function (password) {
    const firstSalt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, firstSalt);
    console.log(password);
    password = hashed;
    console.log(password);
    this.password = password;
    return this.save();
};
UserSchema.methods.isPasswordCorrect = async function (password) {
    const compare = await bcrypt.compare(password, this.password);
    console.log(password);
    console.log(this.password);
    return compare;
};

UserSchema.methods.sign_Otp = async function (OTP) {
    const firstSalt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(OTP, firstSalt);
    OTP = hashed;
    this.otp = OTP;
    return this.save();
}
UserSchema.methods.isOtpCorrect = async function (OTP) {
    const compare = await bcrypt.compare(OTP, this.otp);
    return compare;
};

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this.id,
            name: this.name,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        id: this.id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};





const User = mongoose.model('user', UserSchema);
module.exports = User;