const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
var cookies = require("cookie-parser");

app.use(cookies());


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(cors({
    origin: "https://thuviensocongantinhhungyen.vercel.app",
    credentials: true
}));
app.use(express.json());
const port = process.env.port || 4000;


const authRoute = require('./routes/auth');
const typebookRoute = require('./routes/typebook');
const bookRoute = require('./routes/book');
const homeRoute = require('./routes/home');

app.use('/', homeRoute);
app.use('/api/auth', authRoute);
app.use('/api', typebookRoute);
app.use('/api/quan-ly', bookRoute);

const path = require("path");
const basePath = '';

//cấu hình chạy reactjs trên node server
app.use(basePath + "/", express.static(path.resolve(__dirname + "/build")));

app.get("*", (request, response) => {
  response.sendFile(path.resolve(__dirname + "/build/index.html"));
});
//

app.listen(port, () => {
    console.log('server running ', port)
});


mongoose.connect(process.env.URL_MONGODB,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if(err){
        console.log(err)
    }
    console.log('kết nối db thành công')
})
