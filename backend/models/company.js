const mongoose = require('mongoose');




const companySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    CompanyName: {
        type: String,
        required: true,
        unique: true
    },
    OwnerName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    panNumber: {
        type: String,
        required: true,
        unique: true
    },
    GSTNumber: {
        type: String,
        required: true,
        unique: true
    },
    Address: {
        type: String,
        required: true
    },
   BankName: {
    type: String,
    required: true
   },
   AccountNumber: {
    type: String,
    required: true
   },
   IFSCCode: {
    type: String,
    required: true
   },
   BranchName: {
    type: String,
    required: true
   },
   
   
})
const CompanyModel = mongoose.model('Company', companySchema);

module.exports = CompanyModel;