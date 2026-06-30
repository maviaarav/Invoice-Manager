const CompanyModel = require('../models/company')

const multer = require('multer');


const createCompany = async (req,res) =>{
    try{
        const {
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
            Email,
            termsAndCondition,
            upiID
        } = req.body

        if(
            !CompanyName ||
            !OwnerName ||
            !GSTNumber ||
            !Address ||
            !BankName ||
            !AccountNumber ||
            !IFSCCode ||
            !panNumber ||
            !phoneNumber ||
            !BranchName,
            !Email,
            !termsAndCondition,
            !upiID
        ){
            return res.status(400).json({
                Msg: "All Field Are required"
            })
        }

        const existCompany = await CompanyModel.findOne({
            userId: req.user._id,
            phoneNumber
        })

        if(existCompany){
            return res.status(409).json({
                Msg: "Company Exists"
            })
        }

        let signature = "";
        let stamp = "";

        if(req.files?.signature){
            const file = req.files.signature[0];

            signature =
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        }

        if(req.files?.stamp){
            const file = req.files.stamp[0];

            stamp =
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        }

        await CompanyModel.create({
            userId: req.user._id,
            CompanyName,
            OwnerName,
            phoneNumber,
            Email,
            panNumber,
            GSTNumber,
            Address,
            BankName,
            AccountNumber,
            IFSCCode,
            BranchName,
            signature,
            stamp,
            termsAndCondition,
            upiID
        })

        return res.status(200).json({
            success: true
        })

    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}


const getCompany = async (req,res)=>{
    try{
        const company = await CompanyModel.findOne({userId: req.user._id})
        if(!company){
            return res.status(404).json({Msg: "You haven't created a company profile yet.\nCreate your company profile to start generating invoices and managing your business information."})
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

        const {
            CompanyName,
            OwnerName,
            GSTNumber,
            Address,
            BankName,
            panNumber,
            phoneNumber,
            AccountNumber,
            IFSCCode,
            BranchName,
            Email,
            termsAndCondition,
            upiID
        } = req.body

        const company = await CompanyModel.findOne({
            userId: req.user._id,
            _id: req.params.id
        })

        if(!company){
            return res.status(404).json({
                Msg: "Please Create Company"
            })
        }

        if(req.files?.signature){
            const file = req.files.signature[0];

            company.signature =
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        }

        if(req.files?.stamp){
            const file = req.files.stamp[0];

            company.stamp =
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        }

        company.CompanyName =
            CompanyName || company.CompanyName

        company.OwnerName =
            OwnerName || company.OwnerName

        company.GSTNumber =
            GSTNumber || company.GSTNumber

        company.Address =
            Address || company.Address

        company.BankName =
            BankName || company.BankName

        company.AccountNumber =
            AccountNumber || company.AccountNumber

        company.IFSCCode =
            IFSCCode || company.IFSCCode

        company.BranchName =
            BranchName || company.BranchName

        company.panNumber =
            panNumber || company.panNumber

        company.phoneNumber =
            phoneNumber || company.phoneNumber
        company.Email = Email || company.Email
        company.termsAndCondition = termsAndCondition || company.termsAndCondition
        company.upiID = upiID || company.upiID
        await company.save()

        return res.status(200).json({
            success: true
        })

    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}
const deleteCompany = async (req,res) =>{
    try{
        const email = req.params.email
        const company = await CompanyModel.findOne({
            Email: email
        })

        if(!company){
            return res.status(404).json({
                Msg: "Please Create Company"
            })
        }

        await company.deleteOne()

        return res.status(200).json({
            success: true
        })

    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {
    createCompany,
    getCompany,
    updateCompany,
    deleteCompany
}