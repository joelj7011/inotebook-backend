const mongoose = require('mongoose');
const { Schema } = mongoose;
const JWT_EXPIRES = "1h";
const jwt = require('jsonwebtoken');
const JWT_SECRET = "shivangisagoodboy";
const bcrypt = require("bcryptjs");


const VerificationToken = new Schema({
    owner: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    verifyToken: {
        type: String,
        required: true,
    },
    creatrAd: {
        type: Date,
        expiersIn: JWT_EXPIRES,
        default: Date.now(),
    }
});

VerificationToken.pre("save", async function (next) {
    if (this.isModified("verifyToken")) {
        const firstSalt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(this.verifyToken, firstSalt);
        this.verifyToken = hash;
    }
    next();
});

VerificationToken.methods.compare = async function (verifyToken) {
    const result = await bcrypt.compare(verifyToken, this.verifyToken);
    return result;
}

module.exports = mongoose.model('verificationToken', VerificationToken);

