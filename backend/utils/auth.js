const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const secretKey = process.env.secretKey

const setUser = (user)=>{
    return jwt.sign({
        _id : user._id,
        name: user.name,
        email: user.email
    },secretKey)
}
const getUser = (token) =>{
    if(!token) return null
    return jwt.verify(token,secretKey)
}
module.exports = {
    setUser,
    getUser
}