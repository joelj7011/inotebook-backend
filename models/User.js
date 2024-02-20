const mongoose = require('mongoose');
const { Schema } = mongoose;
const JWT_EXPIRES = "1h";
const jwt = require('jsonwebtoken');
const JWT_SECRET = "shivangisagoodboy";
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
    data: {
        type: Date,
        default: Date.now
    }
})

UserSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

const User = mongoose.model('user', UserSchema);
module.exports = User;