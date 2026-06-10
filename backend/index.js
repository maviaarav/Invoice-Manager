require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const { restrictToLogin } = require('./middlewares/auth')
const UserRouter = require('./routes/user')
const mongoose = require('./connections/server')
const app = express()
app.use(express.json())
app.use(cookieParser())
app.get('/',restrictToLogin,(req,res)=>{
    res.send(
        `<h1>Dashboard</h1>`
    )
})
app.use('/user', UserRouter)
app.listen(3000,()=>{
    console.log("Working at port: http://localhost:3000")
})