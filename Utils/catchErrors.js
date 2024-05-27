
const catchErrors = (status, message, res) => {
    res.sendStatus(status).json({
        success: false,
        message: message,
    })
}

module.exports = catchErrors;