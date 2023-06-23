const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const xssClean = require("xss-clean");
const rateLimit = require('express-rate-limit');
const userRouter = require("./routers/userRouter");
const { seedUser } = require("./controllers/seedController");
const seedRouter = require("./routers/seedRouter");



const app = express(); //app is ready for lisent



//for using the morgan as a middleware 


const rateLimiter = rateLimit({
    windowMs: 1*60*1000, //1 min
    max: 5,
    message: "too many request from this Ip!",
});

app.use(rateLimiter);
app.use(xssClean());
app.use(morgan("dev"));
app.use(bodyParser.json());//express json middleware
app.use(bodyParser.urlencoded({extended: true}));//urlencoded middleware

//users router
// import userRouter from './routers';

app.use('/api/users', userRouter);

app.use('/api/seed', seedRouter);




// const isLoggedIn = (req, res, next) =>{
//    // console.log("isLoggedin middleware");

//    const login = true;

//    if(login){

//     req.body.id = 100;
//     next();
//    }

//    else{
//     return res.status(401).json({message: 'please login first'});
//    }
   
// };



app.get('/test' , rateLimiter, (req, res) =>{
    res.status(200).send({
        message: "Api working fine "
    });
});



//client error handeling
app.use((req, res, next)=>{
  // res.status(404).json({message: 'route not found'});

   
   next(createError(404,'route not found' ));
});

//server error handeling
app.use((err, req, res, next)=>{
   
  // res.status(500).send("something wrong");

  return res.status(err.status || 500).json({
    sucess: false,
    message:  err.message,
  });

 });

module.exports = app;

