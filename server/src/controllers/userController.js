const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const fs = require("fs").promises;

const User = require("../models/userModel");
const { successResponse } = require("./responseController");

const { findWithId } = require("../services/findItem");
const { error, Console } = require("console");
const { deleteImage } = require("../helper/deleteImage");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const { jwtactivationKey, clientURL } = require("../secret");
const emailWithNodeMail = require("../helper/email");




const getUsers =async (req, res, next) =>{
   try {
   
   const search = req.query.search || "";
   const page = req.query.page || 1;
   const limit = req.query.limit || 5;

   const searchRegExp = new RegExp('.*' + search + ".*", 'i');

   const filter = {
      isAdmin: { $ne: true},
      $or:[
         {name: {$regex: searchRegExp}},
         {email: {$regex: searchRegExp}},
         {phone: {$regex: searchRegExp}},

      ]
   };
   const options = {password: 0};

   const users = await User.find(filter, options).limit(limit)
   .skip((page-1)*limit); //pagination one page will show 5 users

   const count =  await User.find(filter).countDocuments();

   if(!users) throw createError(404, "no user found");
    return successResponse(res, {
      statusCode: 200,
      message: 'users returned succesfully',
      payload: {
         users,
         pageination: {
          totalPage: Math.ceil(count/limit),
          currentPage: page, 
          previousPage: page-1 > 0 ? page-1 : null,
          nextPage: page +1 <= Math.ceil(count/limit) ? page + 1 : null,
 
         },
      },
    });

   } catch (error) {
      next(error);
   }
};

const getUserById =async (req, res, next) =>{
   try {
   const id = req.params.id; 
   const options = {password: 0};
   const user =await findWithId(User,id, options);

    return successResponse(res, {
      statusCode: 200,
      message: 'user returned succesfully',
      payload: {
       user
      },
    });

   } catch (error) {
     
      next(error);
   }
};

   const deleteUserById =async (req, res, next) =>{
      try {
      const id = req.params.id; 
      const options = {password: 0};
      const user =await findWithId(User,id, options);

     

      const userImagePath = user.image;

      deleteImage(userImagePath);


      await User.findByIdAndDelete({_id: id, isAdmin: false,});

     
   
       return successResponse(res, {
         statusCode: 200,
         message: 'user delete succesfully',
       });
   
      } catch (error) {
        
         next(error);
      }
};

const processRegister =async (req, res, next) =>{
   try {
   
      const {name, email, password, phone, address} = req.body;

      const image = req.file;

      if(!image){
         throw createError(400, "image is required")
      }

      if(image.size > 1024 * 1024 *2 ){
         throw createError(400, "image is too large support <2MB file");
      }


     


      const imageBufferString = image.buffer.toString('base64');


      const userExists = await User.exists({email: email});

      if(userExists){
         throw createError(409, 'user with this email already exits please sign in');
      };

      // create jwt

    const token =  createJSONWebToken({name, email, password, phone, address, image: imageBufferString}, jwtactivationKey, '10m');


    //prepare email

   const emailData = {
      email, 
      subject: 'Account Activation email',
      html: `
      <h2>hello ${name}! </>
      <p>Please click here to <a href ="${clientURL}/api/users/activate/${token}" target="_blank">activate your account </a>  
      </p>`
   }

    //send email with nodemailer

   try {
     await emailWithNodeMail(emailData);
   } catch (emailError) {
      next(createError(500, 'failed to send verification email'));
      return;
   }

  
  

    return successResponse(res, {
      statusCode: 200,
      message: `please go to your ${email} for completing your registration process`,
      payload: {token},
    });

   } catch (error) {
     
      next(error);
   }
};

const activateUserAccount =async (req, res, next) =>{
  
   try {
      const token = req.body.token;
      if(!token) throw createError(404, 'token not found');
   
    try {
      const decode = jwt.verify(token, jwtactivationKey);

      if(!decode) throw createError(401,"user was not able to verified");

      const userExists = await User.exists({email: decode.email});

      if(userExists){
         throw createError(409, 'user with this email already exits please sign in');
      }

 
       await User.create(decode);

       return successResponse(res, {
         statusCode: 201,
         message: "user was registred succesfully"
        
       });


    } catch (error) {
      if(error.name == 'tokenExpiredError'){
         throw createError(401, 'token has expired');
      }
      else if(error.name == 'JsonWebTokenError'){
         throw createError(401, 'Invalid Token');
      }
      else{
         throw error;
      }
    }



   

   } catch (error) {
     
      next(error);
   }
};

const  updateUserById =async (req, res, next) =>{
   try {
   const userID = req.params.id; 

   const options = {password: 0};
   await findWithId(User,userID, options);

   
   const updateOptions = {new: true, runValidators:true, context: 'query'}; //we set some rules in shcema for appyling this rule we use here runValidators and context

   let updates = {}; 

   // if(req.body.name){
   //    updates.name = req.body.name;
   // }

   // if(req.body.password){
   //    updates.password = req.body.password;
   // }

   // if(req.body.phone){
   //    updates.phone = req.body.phone;
   // }

   // if(req.body.address){
   //    updates.address = req.body.address;
   // }

   for(let key in req.body){
      if(['name', 'password', 'phone', 'address'].includes(key)){
         updates[key] = req.body[key];
      } 

      else if(['name'].includes(key)){
         throw createError(400, "email can not be updated");
      } 
   }

   const image = req.file;

   if(image){
      //image size max 2MB

      if(image.size > 1024 * 1024 *2 ){
         throw createError(400, "image is too large support <2MB file");
      }

      updates.image = image.buffer.toString('base64');
   }

   const updatedUser = await User.findByIdAndUpdate(userID, updates, updateOptions).select("-password"); //after updatation we dont want to see the password field

   //for excluse somehting form the list give the email mistakenly
   //delete updates.email;


   if(!updatedUser){
      throw createError(404, "user with this id does not exist");
   }

  

   

  

    return successResponse(res, {
      statusCode: 200,
      message: 'user updated succesfully',
      payload: updatedUser,
    });

   } catch (error) {
     
      next(error);
   }
};


module.exports = {getUsers, getUserById, deleteUserById, processRegister, activateUserAccount, updateUserById};