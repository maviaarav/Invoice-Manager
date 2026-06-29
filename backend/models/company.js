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
    Email: {
    type: String,
    required: true,
    unique: true
    },
   BankName: {
    type: String,
    required: true,
    unique: true
   },
   AccountNumber: {
    type: String,
    required: true,
    unique: true
   },
   IFSCCode: {
    type: String,
    required: true,
   },
   BranchName: {
    type: String,
    required: true
   },
   signature: {
    type: String,
    default: ""
},

    stamp: {
    type: String,
    default: ""
},
termsAndCondition: {
    type: String,
    required: true
}
   
   
}, { timestamps: true });
const CompanyModel = mongoose.model('Company', companySchema);

module.exports = CompanyModel;