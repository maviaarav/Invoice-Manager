const mongoose = require('mongoose')

mongoose
    .connect('mongodb://127.0.0.1:27017/invoiceManager') // setuping MongoDB with name: invoiceManager
    .then(()=>console.log("MongoDB Connection successful"))
    .catch((error)=>console.log('Error while connecting with MongoDB',error))

    module.exports = mongoose