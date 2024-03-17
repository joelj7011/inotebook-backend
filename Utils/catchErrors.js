
const catchErrors = (status, message, res) => {
    res.status(status).json({
        success: false,
        message: error.message,
    })
}

module.exports = catchErrors;