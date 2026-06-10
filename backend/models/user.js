const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        requred: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
},{timestamps: true})

const userModel = mongoose.model('users', userSchema)

module.exports = userModel

