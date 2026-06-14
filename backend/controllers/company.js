const CompanyModel = require('../models/company')

const createCompany = async (req,res) =>{
    try{
        const { CompanyName, OwnerName, phoneNumber, panNumber, GSTNumber, Address, BankName, AccountNumber, IFSCCode, BranchName} = req.body
    if(!req.body ||
        !req.body.CompanyName ||
        !req.body.OwnerName||
        !req.body.GSTNumber ||
        !req.body.Address ||
        !req.body.BankName ||
        !req.body.AccountNumber ||
        !req.body.IFSCCode ||
        !req.body.panNumber ||
        !req.body.phoneNumber ||
        !req.body.BranchName
    ){
        return res.status(400).json({Msg: "All Field Are required"})
    }
    const existCompany = await CompanyModel.findOne({userId: req.user._id})
    if(existCompany) {
        return res.status(409).json({Msg: "Company Exists"})
    }
    await CompanyModel.create({
        userId: req.user._id,
        CompanyName,
        OwnerName,
        phoneNumber,
        panNumber,
        GSTNumber, 
        Address,
        BankName,
        AccountNumber,
        IFSCCode,
        BranchName,
    })
     return res.status(200).json({success: true})
    }
    catch(error){
         return res.status(500).json({
            message: error.message
        });
    }
}


const getCompany = async (req,res)=>{
    try{
        const company = await CompanyModel.findOne({userId: req.user._id})
        if(!company){
            return res.status(404).json({Msg: "Please Create Company"})
        }
        const companyLength = await CompanyModel.countDocuments({userId: req.user._id})
        return res.status(200).json({success: true, company,companyLength})
    }
    catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}

const updateCompany = async (req,res) =>{
    try{
        const { CompanyName, OwnerName, GSTNumber, Address, BankName, panNumber, phoneNumber, AccountNumber, IFSCCode, BranchName} = req.body
        if(!req.body){
            return res.status(400).json({Msg: "All Field Are required"})
        }
        const company = await CompanyModel.findOne({userId: req.user._id})
        if(!company){
            return res.status(404).json({Msg: "Please Create Company"})
        }
        company.CompanyName = CompanyName || company.CompanyName
        company.OwnerName = OwnerName || company.OwnerName
        company.GSTNumber = GSTNumber || company.GSTNumber
        company.Address = Address || company.Address
        company.BankName = BankName || company.BankName
        company.AccountNumber = AccountNumber || company.AccountNumber
        company.IFSCCode = IFSCCode || company.IFSCCode
        company.BranchName = BranchName || company.BranchName
        await company.save()


        return res.status(200).json({success: true})
    }
    catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}


module.exports = {
    createCompany,
    getCompany,
    updateCompany
}