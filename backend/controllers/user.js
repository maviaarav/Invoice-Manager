const { setUser } = require('../utils/auth')
const bcrypt = require("bcryptjs"); 
const userModel = require('../models/user')

const SignUpHandler = async (req,res) =>{
   try{

    const { name, email, password } = req.body
    if(!req.body ||
        !req.body.name ||
        !req.body.email ||
        !req.body.password
    ){
        return res.status(401).json({Msg: "All fields are required"})
    }
    const existingUser = await userModel.findOne({email})
    if(existingUser){
        return res.status(401).json({Msg: 'User exists'})
    }

    const hashPass = await bcrypt.hash(password,10)
    userModel.create({
        name,
        email,
        password : hashPass
    })
    return res.status(200).json({success: true})
   }catch(error){
    return res.status(401).json({
            message: error.message
        });
   }
}
const HandlerLogin = async (req,res) =>{
    try{
        const { email, password } = req.body
    if(!req.body ||
        !req.body.email ||
        !req.body.password
    ){
        return res.status(401).json({Msg: "Fill all the details"})
    }
    const user = await userModel.findOne({email})
    if(!user){
        return res.status(401).json({
                Msg: "User not found"
            });
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        return res.status(401).json({
                Msg: "email or password is incorrect"
            });
    }
    const token = setUser(user)
    res.cookie("UUID", token,{
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return res.status(200).json({success: true})
    }
    catch(error){
         return res.status(401).json({
            message: error.message
        });
    }
}
module.exports = {
    SignUpHandler,
    HandlerLogin
}