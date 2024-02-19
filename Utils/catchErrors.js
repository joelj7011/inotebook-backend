
const catchErrors = (status, message, res) => {
    res.status(status).json({
        success: false,
        message
    })
}

module.exports = catchErrors;