const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const VerificationTokenSchema = new Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: 3600,
        default: Date.now
    }
});

VerificationTokenSchema.pre("save", async function (next) {
    if (this.isModified("token")) {
        const hash = await bcrypt.hash(this.token, 8);
        this.token = hash;
    }
    next();
});

VerificationTokenSchema.methods.compareToken = async function (token) {
    const limitedAccess = await bcrypt.compare(token, this.token);
    return limitedAccess;
};

module.exports = mongoose.model('VerificationTokenSchema', VerificationTokenSchema);
