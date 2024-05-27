const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');


const VerificationToken = new Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    verifyToken: {
        type: String,
        required: true,
    },
    creatrAd: {
        type: Date,
        expiersIn: process.env.JWT_EXPIRES,
        default: Date.now(),
    }
});

VerificationToken.methods.signOtp = async function (verifyToken) {
    const firstSalt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(verifyToken, firstSalt);
    verifyToken = hash;
    this.verifyToken = verifyToken;
    return this.save();
}

VerificationToken.methods.compare = async function (verifyToken) {
    const result = await bcrypt.compare(verifyToken, this.verifyToken);
    return result;
}

module.exports = mongoose.model('verificationToken', VerificationToken);

