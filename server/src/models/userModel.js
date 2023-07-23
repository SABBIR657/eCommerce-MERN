const{Schema, model} = require("mongoose");
const bcrypt = require('bcryptjs');
const { defaultImagePath } = require("../secret");

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'user name required'],
        trim: true,
        maxlength: [31, 'user name can not over 31 character'],
        minlength: [3, 'user name minimum 3 character'],

    },

    email: {
        type: String,
        required: [true, 'user email required'],
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'please enter a valid email'
        }

    },

    password: {
        type: String,
        required: [true, 'user password required'],  
        minlength: [6, 'user password minimum 6 character'],
        set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10)),


    },

    image: {
        type: String,
        default: defaultImagePath ,
        


    },

    address: {
        type: String,
        minlength: [3, 'user address minimum 3 character'],
        required: [true, 'user address required'],


    },

    phone: {
        type: String,
        required: [true, 'user phone no. required'],


    },

    isAdmin: {
        type: Boolean,
        default: false


    },

    isBanned: {
        type: Boolean,
        default: false


    },

    
},
  {timestamps: true}
);


const User = model('Users', userSchema)

module.exports = User;