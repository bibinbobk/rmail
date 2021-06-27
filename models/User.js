const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    googleid:{
        type: String,
        required: false,
    },
    displayName:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    firstName:{
        type: String,
        required: true,
    },
    lastName:{
        type: String,
    },
    image:{
        type: String,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
})

UserSchema.methods.hashPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))    
}

UserSchema.methods.comparePassword = function (password, hash) {
    return bcrypt.compareSync(password, hash)    
}

module.exports = mongoose.model('User', UserSchema)