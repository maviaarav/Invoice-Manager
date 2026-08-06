const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const mongoURI = process.env.MONGO_URI

mongoose
    .connect(mongoURI) 
    .then(()=>console.log("MongoDB Connection successful"))
    .catch((error)=>console.log('Error while connecting with MongoDB',error))

    module.exports = mongoose