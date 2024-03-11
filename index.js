require('dotenv').config();
const connectToMongo = require('./config/db');
const express = require('express');
var cookieParser = require('cookie-parser')
const cors = require('cors');


const app = express();
const port = 5000;


app.use(express.json());

app.use(cookieParser());

const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
}
app.use(cors(corsOptions));

connectToMongo();
//----------------------available-routes---------------------//
app.use('/api/auth', require('./routes/userRoute'));
app.use('/api/notes', require('./routes/usernotes'));
//----------------------available-routes---------------------//


app.listen(port, () => {
    console.log(`example listening at port: http://localhost:${port}`);
})
