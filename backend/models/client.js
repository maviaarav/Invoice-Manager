const mongoose = require("mongoose")


const clientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
         ref: 'users',
        required: true,
    },
    clientName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    gstNumber: {
        type: String,
        unique: true,
    
    },
    address: {
        type: String,
        required: true
    }
},{ timestamps : true })

const ClientModel = mongoose.model('clients', clientSchema)

module.exports = ClientModel