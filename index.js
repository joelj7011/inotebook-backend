const connectToMongo = require('./config/db');
const express = require('express');
var cookieParser = require('cookie-parser')
const cors = require('cors');

const app = express();
const port = 5000;


app.use(express.json());

app.use(cookieParser());

const corsOptions = {
    origin: "http://localhost:5000",
    credentials: true,
}
app.use(cors(corsOptions));
// //--------------midlleware-------------------------//
// app.use('/', (req, res, next) => {
//     res.set('hello', 'hemang');
//     next();
// })
// //--------------midlleware-------------------------//


// //-------------endpoint----------------------------//
// app.get('/', (req, res) => {
//     const customHandler = res.get('hello');
//     res.send(`hello world! custom handler:${customHandler}`);
// })
// //-------------endpoint----------------------------//
connectToMongo();
//----------------------available-routes---------------------//
app.use('/api/auth', require('./routes/userRoute'));
app.use('/api/notes', require('./routes/usernotes'));
//----------------------available-routes---------------------//


app.listen(port, () => {
    console.log(`example listening at port: http://localhost:${port}`);
})
