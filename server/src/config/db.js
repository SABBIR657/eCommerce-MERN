const mongoose =  require("mongoose")
const { mongodbURL } = require("../secret")
const connectDatabase= async(options= {}) =>{
    try {
        await mongoose.connect(mongodbURL, options);
        console.log('connection to db establish');

        mongoose.connection.on('error', (error)=>{
            console.error('db connection error:' ,error);
        });
    } catch (error) {
        console.error('could not connected to db', error.toString());
    }
};

module.exports = connectDatabase;