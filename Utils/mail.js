
const mail = () => {
    let otp = '';
    for (let i = 0; i <= 3; i++) {
        const rabdval = Math.round(Math.random() * 9);
        otp = otp + rabdval;
    }
    return otp;
}

module.exports = mail;