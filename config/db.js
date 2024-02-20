const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/inotebook";

const connectToMongo = () => {

    try {
        mongoose.connect(mongoURI, {
        }).then((data) => console.log(`connected at server:${data.connection.host}`)
        );
    } catch (error) {
        console.log(error(404));
    }
};

module.exports = connectToMongo;
