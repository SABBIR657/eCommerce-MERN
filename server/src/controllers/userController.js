const createError = require("http-errors");
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const { default: mongoose } = require("mongoose");
const { findUserById } = require("../services/findUser");




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

const getUser =async (req, res, next) =>{
   try {
   const id = req.params.id; 
   const user =await findUserById(id);

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

module.exports = {getUsers, getUser};