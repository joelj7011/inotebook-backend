const nodemailer = require("nodemailer");

exports.generateOtp = async () => {
    let otp = "";
    for (let i = 0; i <= 3; i++) {
        const randomVal = Math.round(Math.random() * 9);
        otp = otp + randomVal;
    }
    return otp;
}

exports.mailTransport = async () => nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRP_USERNAME,
        pass: process.env.MAILTRP_PASSWORD,
    }
})

