const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(express.json({limit:"20kb"}));
app.use(express.urlencoded({extended:true,limit:"20kb"}));
app.use(express.static("public"));

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true}));
    
app.use(cookieParser());

module.exports = app;