const data = require("../data");
const User = require("../models/userModel");

const seedUser = async(req, res, next)=>{
try {
    //deleting all user
  await User.deleteMany({});


   //inserting new user
   const users = await User.insertMany(data.users);

   //succesfull response
   return res.status(201).json(users);


} catch (error) {
    next(error);
}
};

module.exports = {seedUser};