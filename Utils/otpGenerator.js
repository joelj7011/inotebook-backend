const nodemailer = require("nodemailer");

exports.generateOtp = async () => {
    let otp = "";
    for (let i = 0; i <= 3; i++) {
        const randomVal = Math.round(Math.random() * 9);
        otp = otp + randomVal;
    }
    return otp;
}

exports.mailTransport = async () => {
    try {
        console.log('mailtrap->')
        return nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.MAILTRP_USERNAME,
                pass: process.env.MAILTRP_PASSWORD,
            }
           
        })
    } catch (error) {
        console.log("error creating a mail transport->", error);
        throw Error('error creating a mail transport');
    }

}