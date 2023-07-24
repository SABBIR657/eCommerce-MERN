const {body} = require("express-validator");

//registration validation

const validateUserRegistration =[
    body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isLength({min: 3, max: 31})
    .withMessage("name should be at least 3-21 characters long"),

    body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email address"),
    

    body("password")
    .trim()
    .notEmpty()
    .withMessage("password is required")
    .isLength({min: 6})
    .withMessage("password should be at least 6 characters long"),
    // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])}$/
    // )
    // .withMessage('password should contain at least one lowercase letter, one uppercase letter, one number,one special character'),
    



    body("address")
    .trim()
    .notEmpty()
    .withMessage("address is required")
    .isLength({min: 3})
    .withMessage("address should be at least 3 characters long"),


    
    body("phone")
    .trim()
    .notEmpty()
    .withMessage("phone is required"),


    body("image")
    .custom((value, {req}) =>{
        if(!req.file || !req.file.buffer ){
            throw new Error('user image required');
        }
        return true;
    })
   
    .withMessage("user image required"),

];



//sign in validation

module.exports = {validateUserRegistration};