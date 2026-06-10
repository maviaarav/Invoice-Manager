const express = require('express')
const mongoose = require('./connections/server')
const app = express()

app.listen(3000,()=>{
    console.log("Working at port: http://localhost:3000")
})